const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.hidden = isOpen;
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    });
  });
}

const forgeMenuButton = document.querySelector(".forge-menu-button");
const forgeMobileNav = document.querySelector(".forge-mobile-nav");

if (forgeMenuButton && forgeMobileNav) {
  forgeMenuButton.addEventListener("click", () => {
    const isOpen = forgeMenuButton.getAttribute("aria-expanded") === "true";
    forgeMenuButton.setAttribute("aria-expanded", String(!isOpen));
    forgeMenuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    forgeMobileNav.hidden = isOpen;
  });

  forgeMobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      forgeMenuButton.setAttribute("aria-expanded", "false");
      forgeMenuButton.setAttribute("aria-label", "Open navigation");
      forgeMobileNav.hidden = true;
    });
  });
}

const repoSearch = document.querySelector("#repo-search");
const repoFileRows = [...document.querySelectorAll("[data-repo-file]")];
const repoFileEmpty = document.querySelector("#repo-file-empty");
const goToFile = document.querySelector(".go-to-file");

if (repoSearch && repoFileRows.length) {
  const filterFiles = () => {
    const query = repoSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    repoFileRows.forEach((row) => {
      const matches = !query || row.dataset.repoFile.includes(query) || row.textContent.toLowerCase().includes(query);
      row.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (repoFileEmpty) repoFileEmpty.hidden = visibleCount !== 0;
  };

  repoSearch.addEventListener("input", filterFiles);
  goToFile?.addEventListener("click", () => repoSearch.focus());

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

    if ((event.key === "/" || event.key.toLowerCase() === "t") && !isTyping) {
      event.preventDefault();
      repoSearch.focus();
    }

    if (event.key === "Escape" && document.activeElement === repoSearch) {
      repoSearch.value = "";
      filterFiles();
      repoSearch.blur();
    }
  });
}
