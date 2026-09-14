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

const initialSection = window.location.hash.slice(1);
setCurrentSection(document.getElementById(initialSection)?.id || "introduction");
