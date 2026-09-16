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

const fleetRegions = {
  DE: {
    country: "Germany", breadcrumb: "WORLD / EUROPE", nodes: "1,450", suppliers: "1 supplier", capacity: 82,
    stats: [["Healthy", "1,369"], ["CPU avg", "60.3%"], ["Egress", "91.2 Gbps"]],
    signals: [["warn", "DEGRADED 19"], ["", "DRAINING 27"], ["bad", "UNREACHABLE 7"]],
    machines: [
      ["de-hetzner-00042", "Hetzner · AX42", "build runner", "HEALTHY", ""],
      ["de-hetzner-00317", "8C · 64 GB · 2×512 NVMe", "build runner", "HEALTHY", ""],
      ["de-hetzner-00802", "1 Gbit · unlimited", "replica", "DRAINING", "warn"],
      ["de-hetzner-01194", "Falkenstein · FSN1", "edge", "HEALTHY", ""],
    ],
  },
  FI: {
    country: "Finland", breadcrumb: "WORLD / EUROPE", nodes: "900", suppliers: "1 supplier", capacity: 76,
    stats: [["Healthy", "849"], ["CPU avg", "59.2%"], ["Egress", "56.1 Gbps"]],
    signals: [["warn", "DEGRADED 16"], ["", "DRAINING 16"], ["bad", "UNREACHABLE 1"]],
    machines: [
      ["fi-hetzner-00018", "Hetzner · AX42", "build runner", "HEALTHY", ""],
      ["fi-hetzner-00291", "8C · 64 GB · 2×512 NVMe", "replica", "HEALTHY", ""],
      ["fi-hetzner-00588", "Helsinki · HEL1", "build runner", "DEGRADED", "warn"],
      ["fi-hetzner-00813", "1 Gbit · unlimited", "edge", "HEALTHY", ""],
    ],
  },
  US: {
    country: "United States", breadcrumb: "WORLD / NORTH AMERICA", nodes: "900", suppliers: "3 suppliers", capacity: 68,
    stats: [["Healthy", "835"], ["CPU avg", "47.9%"], ["Egress", "56.9 Gbps"]],
    signals: [["warn", "DEGRADED 25"], ["", "DRAINING 20"], ["bad", "UNREACHABLE 3"]],
    machines: [
      ["us-ovhcloud-00112", "OVHcloud · RISE-1", "regional edge", "HEALTHY", ""],
      ["us-interserver-00073", "28C · 128 GB · 2×24 TB", "artifact store", "HEALTHY", ""],
      ["us-reliablesite-00141", "Ryzen 5600X · 64 GB", "git replica", "DEGRADED", "warn"],
      ["us-ovhcloud-00354", "1 Gbit public · private", "regional edge", "HEALTHY", ""],
    ],
  },
  NL: {
    country: "Netherlands", breadcrumb: "WORLD / EUROPE", nodes: "230", suppliers: "2 suppliers", capacity: 61,
    stats: [["Healthy", "218"], ["CPU avg", "45.3%"], ["Egress", "14.2 Gbps"]],
    signals: [["warn", "DEGRADED 1"], ["", "DRAINING 4"], ["bad", "UNREACHABLE 2"]],
    machines: [
      ["nl-nforce-00029", "NFOrce · DL320e v2", "regional edge", "HEALTHY", ""],
      ["nl-nforce-00108", "4C · 16 GB · 2×2 TB", "git replica", "HEALTHY", ""],
      ["nl-hivelocity-00041", "Xeon E-2336 · 32 GB", "regional edge", "DRAINING", "warn"],
      ["nl-hivelocity-00066", "1 Gbit · 20 TB", "build runner", "HEALTHY", ""],
    ],
  },
  BR: {
    country: "Brazil", breadcrumb: "WORLD / SOUTH AMERICA", nodes: "140", suppliers: "1 supplier", capacity: 57,
    stats: [["Healthy", "133"], ["CPU avg", "44.3%"], ["Replicas", "140"]],
    signals: [["", "MAINTENANCE 3"], ["", "DRAINING 4"], ["good", "UNREACHABLE 0"]],
    machines: [
      ["br-adentro-00012", "Adentro · Dedicado Light", "git replica", "HEALTHY", ""],
      ["br-adentro-00048", "28C · 64 GB DDR4", "git replica", "HEALTHY", ""],
      ["br-adentro-00089", "250 GB all-flash", "storage", "MAINTENANCE", "warn"],
      ["br-adentro-00131", "Unlimited transfer", "regional edge", "HEALTHY", ""],
    ],
  },
  AU: {
    country: "Australia", breadcrumb: "WORLD / OCEANIA", nodes: "50", suppliers: "1 supplier", capacity: 49,
    stats: [["Healthy", "47"], ["CPU avg", "43.5%"], ["Egress", "32.4 Gbps"]],
    signals: [["", "MAINTENANCE 1"], ["", "DRAINING 2"], ["good", "UNREACHABLE 0"]],
    machines: [
      ["au-ransomit-00004", "RansomIT · E-2136", "regional edge", "HEALTHY", ""],
      ["au-ransomit-00017", "6C · 64 GB · 2×500 NVMe", "regional edge", "HEALTHY", ""],
      ["au-ransomit-00033", "10 Gbit · 20 TB", "git replica", "DRAINING", "warn"],
      ["au-ransomit-00049", "Melbourne · ME2", "edge", "HEALTHY", ""],
    ],
  },
};

const fleetCockpit = document.querySelector("[data-fleet-cockpit]");
let selectedFleetRegion = "DE";

function createFact([label, value]) {
  const item = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  item.append(term, description);
  return item;
}

function createMachine([id, detail, role, status, statusClass]) {
  const row = document.createElement("div");
  const identity = document.createElement("span");
  const name = document.createElement("b");
  const meta = document.createElement("small");
  const roleLabel = document.createElement("em");
  const state = document.createElement("strong");
  name.textContent = id;
  meta.textContent = detail;
  roleLabel.textContent = role;
  state.textContent = status;
  if (statusClass) state.className = statusClass;
  identity.append(name, meta);
  row.append(identity, roleLabel, state);
  return row;
}

function selectFleetRegion(code) {
  const region = fleetRegions[code];
  if (!fleetCockpit || !region) return;
  selectedFleetRegion = code;
  fleetCockpit.dataset.selectedRegion = code;
  fleetCockpit.querySelectorAll("[data-fleet-region]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.fleetRegion === code));
  });
  fleetCockpit.querySelector("[data-fleet-flag]").src = `/public/flags/${code.toLowerCase()}.svg`;
  fleetCockpit.querySelector("[data-fleet-breadcrumb]").textContent = region.breadcrumb;
  fleetCockpit.querySelector("[data-fleet-country]").textContent = region.country;
  fleetCockpit.querySelector("[data-fleet-nodes]").textContent = region.nodes;
  fleetCockpit.querySelector("[data-fleet-suppliers]").textContent = region.suppliers;
  fleetCockpit.querySelector("[data-fleet-stats]").replaceChildren(...region.stats.map(createFact));
  fleetCockpit.querySelector("[data-fleet-live]").textContent = `${region.capacity.toFixed(1)}%`;
  fleetCockpit.querySelector(".focus-capacity b").style.width = `${region.capacity}%`;
  fleetCockpit.querySelector("[data-fleet-signals]").replaceChildren(...region.signals.map(([kind, label]) => {
    const signal = document.createElement("span");
    signal.className = kind ? `signal-${kind}` : "";
    signal.textContent = label;
    return signal;
  }));
  fleetCockpit.querySelector("[data-fleet-roster]").replaceChildren(...region.machines.map(createMachine));
}

fleetCockpit?.querySelectorAll("[data-fleet-region]").forEach((button) => button.addEventListener("click", () => selectFleetRegion(button.dataset.fleetRegion)));

if (fleetCockpit && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.setInterval(() => {
    if (document.hidden) return;
    const region = fleetRegions[selectedFleetRegion];
    const jitter = Math.sin(Date.now() / 3800) * 0.4;
    fleetCockpit.querySelector("[data-fleet-live]").textContent = `${(region.capacity + jitter).toFixed(1)}%`;
  }, 2200);
}

const initialSection = window.location.hash.slice(1);
setCurrentSection(document.getElementById(initialSection)?.id || "introduction");
