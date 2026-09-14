import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, SITE_PAGES } from "../site/site-routes.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(scriptDirectory);
const contentDirectory = path.join(projectDirectory, "site", "content");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const indent = (value, spaces) => value
  .split("\n")
  .map((line) => line ? `${" ".repeat(spaces)}${line}` : line)
  .join("\n");

const pageUrl = (page) => `${SITE.origin}${page.canonicalPath ?? page.path}`;

const renderCriticalStyles = (page) => page.id === "home"
  ? `    <style>
      body.school-home-page { margin: 0; min-width: 320px; background: #08090a; color: #f2f2ef; }
      .school-header { align-items: center; display: grid; grid-template-columns: 300px minmax(0, 1fr) auto; height: 72px; padding: 0 28px 0 30px; }
      .school-brand { align-items: center; display: inline-flex; gap: 10px; width: max-content; }
      .school-brand img { display: block; height: 29px; object-fit: contain; width: 29px; }
      @media (max-width: 880px) { .school-header { display: flex; height: 88px; justify-content: space-between; padding: 20px 36px 14px; } .school-top-nav, .school-header-actions { display: none; } }
    </style>`
  : "";

export const createSitemap = () => {
  const urls = SITE_PAGES
    .filter((page) => page.robots?.startsWith("index"))
    .map((page) => `  <url><loc>${pageUrl(page)}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

const renderHead = (page) => {
  const title = escapeHtml(page.pageTitle);
  const description = escapeHtml(page.description);
  const canonicalUrl = pageUrl(page);

  return `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="${escapeHtml(page.themeColor ?? SITE.themeColor ?? "#101211")}" />
    <meta name="description" content="${description}" />
    <meta name="author" content="${escapeHtml(SITE.author)}" />
    <meta name="robots" content="${escapeHtml(page.robots ?? "index, follow")}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(SITE.name)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${SITE.origin}${SITE.ogImage}" />
    <meta property="og:image:type" content="${escapeHtml(SITE.ogImageType)}" />
    <meta property="og:image:width" content="${SITE.ogImageWidth}" />
    <meta property="og:image:height" content="${SITE.ogImageHeight}" />
    <meta property="og:image:alt" content="${escapeHtml(SITE.ogImageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${SITE.origin}${SITE.ogImage}" />
    <meta name="twitter:image:alt" content="${escapeHtml(SITE.ogImageAlt)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" href="/public/logo.png" type="image/png" />
${renderCriticalStyles(page)}
${["styles.css", ...(page.styles ?? [])]
  .map((stylesheet) => `    <link rel="stylesheet" href="/${stylesheet}" />`)
  .join("\n")}
    <title>${title}</title>
  </head>`;
};

const siteNavLinks = [
  { id: "source", href: "https://github.com/forkalope/web", label: "Source", mobileLabel: "Source / GitHub", external: true },
  { id: "demo", href: "#current-build", label: "Demo", mobileLabel: "Demo / current build", homeOnly: true },
  { id: "landscape", href: "/landscape/", label: "The landscape" },
  { id: "faq", href: "/faq/", label: "FAQ" },
  { id: "co-sysops", href: "/co-sysops/", label: "Co-Sysops" },
  { id: "business", href: "/business/", label: "For business", action: true },
  { id: "partners", href: "/partners/", label: "Partners", action: true },
];

const linkAttributes = (link, page) => {
  const current = link.id === page.navCurrent;
  const classes = [link.action ? "nav-action" : "", current ? "is-current" : ""]
    .filter(Boolean)
    .join(" ");
  const classAttribute = classes ? ` class="${classes}"` : "";
  const currentAttribute = current ? ' aria-current="page"' : "";
  const externalAttributes = link.external ? ' target="_blank" rel="noreferrer"' : "";
  return `${classAttribute} href="${link.href}"${currentAttribute}${externalAttributes}`;
};

const renderSiteHeader = (page) => {
  const links = siteNavLinks
    .filter((link) => !link.homeOnly || page.id === "home")
    .map((link) => `        <a${linkAttributes(link, page)}>${link.label}${link.external || link.action ? ' <span aria-hidden="true">↗</span>' : ""}</a>`)
    .join("\n");
  const mobileLinks = siteNavLinks
    .filter((link) => !link.homeOnly || page.id === "home")
    .map((link) => `        <a${linkAttributes(link, page)}>${link.mobileLabel ?? link.label} <span aria-hidden="true">↘</span></a>`)
    .join("\n");

  return `<header class="site-header">
      <a class="brand" href="/" aria-label="Forkalope home"><img class="brand-mark" src="/public/logo.png" alt="" /><span class="brand-name">forkalope</span></a>
      <nav class="site-nav" aria-label="Main navigation">
${links}
      </nav>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu"><span>Menu</span><i aria-hidden="true"></i></button>
      <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" hidden>
${mobileLinks}
      </nav>
    </header>`;
};

const renderLegalHeader = (page) => `<header class="site-header legal-header">
      <a class="brand" href="/" aria-label="Forkalope home"><img class="brand-mark" src="/public/logo.png" alt="" /><span class="brand-name">forkalope</span></a>
      <nav class="legal-nav" aria-label="Legal navigation"><a href="/privacy/"${page.navCurrent === "privacy" ? ' aria-current="page"' : ""}>Privacy</a><a href="/terms/"${page.navCurrent === "terms" ? ' aria-current="page"' : ""}>Terms</a><a href="/">Home ↗</a></nav>
    </header>`;

const renderRepoHeader = () => `<header class="forge-header">
      <div class="forge-header-primary">
        <button class="forge-menu-button" type="button" aria-expanded="false" aria-controls="forge-mobile-nav" aria-label="Open navigation">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <a class="forge-brand" href="/" aria-label="Forkalope home"><img src="/public/logo.png" alt="" /><span>Forkalope</span></a>
        <span class="forge-header-divider" aria-hidden="true"></span>
        <div class="forge-context"><a href="/">forkalope</a><b>/</b><strong>forge</strong><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" /></svg></div>
        <nav class="forge-header-actions" aria-label="Account and repository actions">
          <label class="forge-search">
            <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <span class="sr-only">Search repository files</span>
            <input id="repo-search" type="search" placeholder="Search this repository..." autocomplete="off" />
            <kbd>/</kbd>
          </label>
          <div class="forge-create-wrap">
            <button class="forge-header-button forge-create" type="button" aria-expanded="false" aria-controls="forge-create-menu" aria-haspopup="menu"><span aria-hidden="true">+</span> Create <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" /></svg></button>
            <div class="forge-create-menu" id="forge-create-menu" role="menu" hidden>
              <p>Create in Forkalope</p>
              <a href="https://github.com/forkalope/web/issues/new" target="_blank" rel="noreferrer" role="menuitem"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1"/></svg><span>New issue</span><small>GitHub ↗</small></a>
              <a href="https://github.com/forkalope/web/fork" target="_blank" rel="noreferrer" role="menuitem"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 4v12M17 4v4a4 4 0 0 1-4 4H7M4 16l3 3 3-3"/></svg><span>Fork repository</span><small>GitHub ↗</small></a>
              <a href="/co-sysops/" role="menuitem"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Join a node</span><small>Explore →</small></a>
            </div>
          </div>
          <a class="forge-header-button forge-inbox" href="https://github.com/forkalope/web/issues" target="_blank" rel="noreferrer"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5h16l2 9v5H2v-5l2-9Z" /><path d="M2 14h5l2 3h6l2-3h5" /></svg><span>Issues</span></a>
          <a class="forge-account" href="https://github.com/forkalope" target="_blank" rel="noreferrer" aria-label="Forkalope on GitHub">FL</a>
        </nav>
      </div>
      <nav class="forge-mobile-nav" id="forge-mobile-nav" aria-label="Mobile navigation" hidden>
        <a href="#readme">README</a><a href="#status">Status</a><a href="#network">Network</a><a href="/co-sysops/">Co-Sysops</a><a href="/business/">Business</a><a href="/faq/">FAQ</a>
      </nav>
    </header>`;

const renderSchoolHeader = () => `<header class="school-header">
      <a class="school-brand" href="/" aria-label="Forkalope home"><img src="/public/logo.png" alt="" /><span>forkalope <em>/ flight school</em></span></a>
      <nav class="school-top-nav" aria-label="Primary navigation"><a class="is-current" href="#introduction">School</a><a href="#program">The program</a><a href="#teams">For teams</a></nav>
      <div class="school-header-actions"><a href="https://github.com/forkalope" target="_blank" rel="noreferrer">GitHub</a><a class="join-link" href="https://github.com/forkalope/web/issues/new?title=First%20cohort%20interest" target="_blank" rel="noreferrer">Join the first cohort</a></div>
      <div class="mobile-header-actions"><button type="button" class="mobile-search-toggle" aria-label="Search this page"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></button><button type="button" class="mobile-menu-toggle" aria-label="Open menu" aria-expanded="false"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></button></div>
    </header>`;

const renderHeader = (page) => page.header === "legal"
  ? renderLegalHeader(page)
  : page.header === "repo"
    ? renderRepoHeader()
    : page.header === "school"
      ? renderSchoolHeader()
      : renderSiteHeader(page);

const footerLinks = [
  { href: "/landscape/", label: "The landscape" },
  { href: "/co-sysops/", label: "Co-Sysops" },
  { href: "/business/", label: "For business" },
  { href: "/partners/", label: "Partners" },
  { href: "/faq/", label: "FAQ" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/terms/", label: "Terms" },
];

const renderFooter = (page) => {
  if (page.footer === "school") {
    return `<footer class="school-footer"><span>© 2026 forkalope</span><span>First cohort · forming</span><a href="https://github.com/forkalope" target="_blank" rel="noreferrer">Built in the open ↗</a></footer>`;
  }
  if (page.footer === "repo") {
    return `<footer class="forge-footer">
      <div class="forge-footer-inner">
        <div class="forge-footer-brand"><a href="/" aria-label="Forkalope home"><img src="/public/logo.png" alt="" /><span>Forkalope</span></a><p>Open-source forge for the distributed web.</p><span>© 2026 Forkalope</span></div>
        <nav aria-label="Project"><b>Project</b><a href="https://github.com/forkalope/web" target="_blank" rel="noreferrer">Source</a><a href="/landscape/">Landscape</a><a href="/faq/">FAQ</a><a href="/partners/">Partners</a></nav>
        <nav aria-label="Legal"><b>Legal</b><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a></nav>
        <nav aria-label="Follow"><b>Follow</b><a href="https://github.com/forkalope" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.reddit.com/r/forkalope/" target="_blank" rel="noreferrer">Reddit</a><a href="https://discord.gg/forkalope" target="_blank" rel="noreferrer">Discord</a><a href="https://x.com/forkalope" target="_blank" rel="noreferrer">X</a></nav>
      </div>
    </footer>`;
  }
  const links = page.footer === "legal"
    ? footerLinks.filter((link) => ["/co-sysops/", "/business/", "/partners/"].includes(link.href))
    : footerLinks;
  const linkMarkup = links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("");
  const legalMarkup = `<div class="footer-legal"><a href="/privacy/"${page.navCurrent === "privacy" ? ' aria-current="page"' : ""}>Privacy</a><a href="/terms/"${page.navCurrent === "terms" ? ' aria-current="page"' : ""}>Terms</a></div>`;

  return `<footer class="site-footer">
      <div class="footer-brand"><a class="brand" href="/"><img class="brand-mark" src="/public/logo.png" alt="" /><span class="brand-name">forkalope</span></a><p>Code that roams free.</p></div>
      <div class="footer-links">${linkMarkup}</div>
      <div class="footer-meta"><span>Early build · 2026</span>${page.footer === "legal" ? legalMarkup : "<span>Built in the open</span>"}</div>
    </footer>`;
};

const renderScripts = (page) => (page.scripts ?? [])
  .map((script) => `    <script src="/${script}"></script>`)
  .join("\n");

export const renderDocument = (page, content) => {
  const htmlClass = page.htmlClass ? ` class="${page.htmlClass}"` : "";
  const bodyClass = page.bodyClass ? ` class="${page.bodyClass}"` : "";
  const isRedirect = Boolean(page.redirectTo);

  if (isRedirect) {
    return `<!doctype html>
<html lang="en"${htmlClass}>
${renderHead(page).replace("    <title>", `    <meta http-equiv="refresh" content="0; url=${page.redirectTo}" />\n    <title>`)}
  <body${bodyClass}>
${indent(content, 4)}
  </body>
</html>
`;
  }

  const header = renderHeader(page);
  const footer = renderFooter(page);
  const scripts = renderScripts(page);

  return `<!doctype html>
<html lang="en"${htmlClass}>
${renderHead(page)}
  <body${bodyClass}>
    <!-- Generated by scripts/build-site-pages.js. Edit site/ sources instead. -->
${indent(header, 4)}
${indent(content, 4)}
${indent(footer, 4)}
${scripts ? `\n${scripts}` : ""}
  </body>
</html>
`;
};

const outputPathForPage = (outputDirectory, page) => page.path === "/"
  ? path.join(outputDirectory, "index.html")
  : path.join(outputDirectory, page.path.slice(1), "index.html");

export const buildSitePages = async ({ outputDirectory }) => {
  if (!outputDirectory) throw new Error("An output directory is required");

  const contentNames = [...new Set(SITE_PAGES.map((page) => page.content).filter(Boolean))];
  const contentEntries = await Promise.all(contentNames.map(async (name) => [
    name,
    (await fs.readFile(path.join(contentDirectory, `${name}.html`), "utf8")).trim(),
  ]));
  const content = Object.fromEntries(contentEntries);

  for (const page of SITE_PAGES) {
    const pageContent = content[page.content];
    if (!pageContent) throw new Error(`Missing content for ${page.id}`);

    const outputPath = outputPathForPage(outputDirectory, page);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, renderDocument(page, pageContent));
  }

  await fs.writeFile(path.join(outputDirectory, "sitemap.xml"), createSitemap());
  return outputDirectory;
};

const isMainModule = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  const outputDirectory = process.env.FORKALOPE_PAGES_DIR
    ? path.resolve(process.env.FORKALOPE_PAGES_DIR)
    : path.join(projectDirectory, ".generated");

  buildSitePages({ outputDirectory }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
