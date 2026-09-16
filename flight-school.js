const sidebar = document.querySelector(".school-sidebar");
const searchInput = document.querySelector("#school-search");
const menuButtons = document.querySelectorAll(".mobile-menu-toggle, .crumb-menu");
const sectionLinks = [...document.querySelectorAll('.nav-link[href^="#"], .on-page a[href^="#"]')];
const breadcrumbGroup = document.querySelector(".mobile-breadcrumb > span:first-of-type");
const breadcrumbTitle = document.querySelector(".mobile-breadcrumb strong");

function setSidebar(open) {
  if (!sidebar) return;
  sidebar.classList.toggle("is-open", open);
  document.body.classList.toggle("no-scroll", open && window.innerWidth <= 880);
  menuButtons.forEach((button) => button.setAttribute("aria-expanded", String(open)));
  document.querySelector(".mobile-menu-toggle")?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.querySelector(".crumb-menu")?.setAttribute("aria-label", open ? "Close school menu" : "Open school menu");
}

menuButtons.forEach((button) => button.addEventListener("click", () => setSidebar(!sidebar?.classList.contains("is-open"))));
document.querySelector(".mobile-search-toggle")?.addEventListener("click", () => {
  setSidebar(true);
  window.setTimeout(() => searchInput?.focus(), 0);
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    setSidebar(true);
    searchInput?.focus();
  }
  if (event.key === "Escape") setSidebar(false);
});

searchInput?.addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".nav-group").forEach((group) => {
    let visible = 0;
    group.querySelectorAll(".nav-link").forEach((link) => {
      const matches = !query || link.textContent.toLowerCase().includes(query);
      link.hidden = !matches;
      if (matches) visible += 1;
    });
    group.hidden = visible === 0;
  });
});

document.querySelectorAll(".school-sidebar a[href]").forEach((link) => link.addEventListener("click", () => setSidebar(false)));

const interestForm = document.querySelector("[data-interest-form]");
interestForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = new FormData(interestForm);
  const name = String(values.get("name") || "").trim();
  const email = String(values.get("email") || "").trim();
  const experience = String(values.get("experience") || "").trim();
  const goals = String(values.get("goals") || "").trim();
  const subject = `First-cohort interest — ${name}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Current experience: ${experience}`,
    "",
    "What I want to learn:",
    goals,
  ].join("\n");
  const status = interestForm.querySelector("[data-form-status]");
  if (status) status.textContent = "Opening a private email draft…";
  window.location.href = `mailto:hello@forkalope.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.querySelectorAll("[data-drill-question]").forEach((question) => {
  const feedback = question.querySelector("[data-drill-feedback]");
  question.querySelectorAll("[data-drill-choice]").forEach((choice) => choice.addEventListener("click", () => {
    const isSafe = choice.dataset.drillChoice === "safe";
    question.querySelectorAll("[data-drill-choice]").forEach((button) => button.classList.toggle("is-selected", button === choice));
    if (feedback) feedback.textContent = isSafe
      ? "Good first move. Establish scope and evidence before restarting a service."
      : "Too early. A restart might change the evidence and hide the blast radius."
  }));
});

function setCurrentSection(id) {
  const currentSection = document.querySelector(`#${id}`);
  if (!currentSection) return;

  sectionLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-current", isCurrent);
    link.toggleAttribute("aria-current", isCurrent);
  });

  if (breadcrumbGroup) breadcrumbGroup.textContent = currentSection.dataset.group || "Start here";
  if (breadcrumbTitle) breadcrumbTitle.textContent = currentSection.dataset.title || "Introduction";
}

const trackedSections = [...document.querySelectorAll(".tracked-section")];
if ("IntersectionObserver" in window && trackedSections.length) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) setCurrentSection(visible[0].target.id);
  }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
  trackedSections.forEach((section) => observer.observe(section));
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 880) setSidebar(false);
});

const chassisCatalog = {
  c6620: {
    label: "Rental example · Sydney, Australia",
    title: "PowerEdge C6620",
    description: "A compact compute node with a concrete storage decision: four SSDs, configured as RAID 10.",
    facts: [["CPU", "16 physical cores"], ["Memory", "64 GB DDR5"], ["Storage", "960 GB usable"], ["Transfer", "5 TB / month"]],
  },
  m630: {
    label: "Chassis study · configuration varies",
    title: "PowerEdge M630",
    description: "A blade server shares power, cooling, and networking through its enclosure. That density changes the failure domain.",
    facts: [["Form", "Blade server"], ["Generation", "Dell 13G"], ["Compute", "Dual-socket chassis"], ["Dependencies", "Shared enclosure"]],
  },
  r620: {
    label: "Chassis study · configuration varies",
    title: "PowerEdge R620",
    description: "A dense 1U rack server. Drive layout, memory population, and remote management all become part of the operating picture.",
    facts: [["Form", "1U rack server"], ["Generation", "Dell 12G"], ["Compute", "Dual-socket chassis"], ["Storage", "Front hot-swap bays"]],
  },
};

const regionCatalog = {
  DE: { place: "Falkenstein, Germany", offer: "Hetzner AX42", role: "Build runners", facts: [["CPU", "8 physical cores"], ["Memory", "64 GB DDR5 ECC"], ["Local disks", "2 × 512 GB NVMe"], ["Network", "1 Gbps · unlimited"]], mission: "Drain a build runner, deploy a change, and prove the queue keeps moving.", source: "https://www.hetzner.com/dedicated-rootserver/ax42/" },
  FI: { place: "Helsinki, Finland", offer: "Hetzner AX42", role: "Build runners", facts: [["CPU", "8 physical cores"], ["Memory", "64 GB DDR5 ECC"], ["Local disks", "2 × 512 GB NVMe"], ["Network", "1 Gbps · unlimited"]], mission: "Lose the German pool, shift builds north, and verify the artifact chain.", source: "https://www.hetzner.com/dedicated-rootserver/ax42/" },
  US: { place: "NYC metro, United States", offer: "InterServer dual Xeon", role: "Artifact store", facts: [["CPU", "28 physical cores"], ["Memory", "128 GB"], ["Local disks", "2 × 24 TB SATA"], ["Network", "1 Gbps · unmetered"]], mission: "Recover an artifact after a bad retention rule removes the nearest copy.", source: "https://www.interserver.net/dedicated/" },
  BR: { place: "Brazil", offer: "Adentro Dedicado Light", role: "Git replica", facts: [["CPU", "28 cores / 56 threads"], ["Memory", "64 GB DDR4"], ["Local disks", "2 × 100 GB SSD"], ["Storage", "250 GB all-flash"]], mission: "Promote a regional replica while the primary route is unavailable.", source: "https://adentro.com.br/solucoes/servidor-dedicado/" },
  SG: { place: "Singapore", offer: "Latitude.sh m4.metal.small", role: "Regional edge", facts: [["CPU", "6 physical cores"], ["Memory", "48 GB"], ["Local disks", "2 × 960 GB NVMe"], ["Transfer", "20 TB outbound"]], mission: "Trace a slow clone across the edge and decide whether to drain the node.", source: "https://www.latitude.sh/pricing/m4-metal-small" },
  AU: { place: "Melbourne, Australia", offer: "RansomIT E-2136", role: "Regional edge", facts: [["CPU", "6 physical cores"], ["Memory", "64 GB"], ["Local disks", "2 × 500 GB NVMe"], ["Network", "10 Gbps · 20 TB"]], mission: "Keep service inside its traffic budget during a sudden replication burst.", source: "https://secure.ransomit.com.au/index.php?rp=/store/melbourne-dedicated-servers" },
};

function renderFacts(container, facts) {
  if (!container) return;
  container.replaceChildren(...facts.map(([label, value]) => {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    item.append(term, description);
    return item;
  }));
}

const hardwareLab = document.querySelector("[data-hardware-lab]");
hardwareLab?.querySelectorAll("[data-chassis]").forEach((button) => button.addEventListener("click", () => {
  const chassis = chassisCatalog[button.dataset.chassis];
  if (!chassis) return;
  hardwareLab.querySelectorAll("[data-chassis]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
  hardwareLab.querySelector("[data-chassis-label]").textContent = chassis.label;
  hardwareLab.querySelector("[data-chassis-title]").textContent = chassis.title;
  hardwareLab.querySelector("[data-chassis-description]").textContent = chassis.description;
  renderFacts(hardwareLab.querySelector("[data-chassis-facts]"), chassis.facts);
}));

const regionExplorer = document.querySelector("[data-region-explorer]");
function selectRegion(code) {
  const region = regionCatalog[code];
  if (!regionExplorer || !region) return;
  regionExplorer.querySelectorAll("[data-region]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice.dataset.region === code)));
  regionExplorer.querySelector("[data-region-flag]").src = `/public/flags/${code.toLowerCase()}.svg`;
  regionExplorer.querySelector("[data-region-place]").textContent = region.place;
  regionExplorer.querySelector("[data-region-offer]").textContent = region.offer;
  regionExplorer.querySelector("[data-region-role]").textContent = region.role;
  regionExplorer.querySelector("[data-region-mission]").textContent = region.mission;
  regionExplorer.querySelector("[data-region-source]").href = region.source;
  renderFacts(regionExplorer.querySelector("[data-region-facts]"), region.facts);
}

regionExplorer?.querySelectorAll("[data-region]").forEach((button) => button.addEventListener("click", () => selectRegion(button.dataset.region)));
document.querySelectorAll("[data-region-link]").forEach((link) => link.addEventListener("click", () => selectRegion(link.dataset.regionLink)));

const initialSection = window.location.hash.slice(1);
setCurrentSection(document.getElementById(initialSection)?.id || "introduction");
