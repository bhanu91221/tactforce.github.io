// TactForce — Console Dark site logic
// Alpine v3 + minimal vanilla helpers. Theme: dark default + light variant via [data-theme] attr.

document.addEventListener("alpine:init", () => {
  // Shared store: theme + content
  const siteStore = {
    content: window.siteContent,
    darkMode: true,

    init() {
      const saved = localStorage.getItem("theme");
      this.darkMode = saved !== "light"; // dark by default
      this.applyTheme();
    },

    toggleTheme() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("theme", this.darkMode ? "dark" : "light");
      this.applyTheme();
    },

    applyTheme() {
      const root = document.documentElement;
      root.setAttribute("data-theme", this.darkMode ? "dark" : "light");
      // Keep .dark class in sync so legacy Tailwind dark: utilities still work.
      root.classList.toggle("dark", this.darkMode);
    },
  };

  // Index page
  Alpine.data("site", () => ({
    ...siteStore,
    mobileMenuOpen: false,
    contactSent: false,
    toggleMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; },
  }));

  // Tools page
  Alpine.data("toolsApp", () => ({
    ...siteStore,
    mobileMenuOpen: false,
    toggleMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; },
    get visibleTools() {
      return (this.content.tools || []).filter((t) => !t.hidden);
    },
  }));

  // Guides page
  Alpine.data("guideApp", () => ({
    ...siteStore,
    id: new URLSearchParams(window.location.search).get("id"),
    guideDropdownOpen: false,
    mobileMenuOpen: false,
    toggleMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; },
    get currentGuide() { return this.content.guides[this.id]; },
    get availableGuides() {
      return Object.entries(this.content.guides).map(([key, g]) => ({ id: key, title: g.title }));
    },
    navigateToGuide(guideId) {
      window.location.href = "guides.html?id=" + encodeURIComponent(guideId);
    },
    init() {
      siteStore.init.call(this);
    },
  }));
});

// ----------------------------------------------------------------------------
// Live UTC clock — updates any element with [data-utc] every second.
// ----------------------------------------------------------------------------
function tickUTC() {
  const els = document.querySelectorAll("[data-utc]");
  if (!els.length) return;
  const d = new Date();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  const txt = `${hh}:${mm}:${ss} UTC`;
  els.forEach((el) => { el.textContent = txt; });
}
setInterval(tickUTC, 1000);
document.addEventListener("DOMContentLoaded", tickUTC);

// ----------------------------------------------------------------------------
// Scroll-reveal observer
// ----------------------------------------------------------------------------
function initScrollReveal() {
  if (!("IntersectionObserver" in window)) return;
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("active");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
}
window.initScrollReveal = initScrollReveal;
document.addEventListener("DOMContentLoaded", () => setTimeout(initScrollReveal, 50));

// ----------------------------------------------------------------------------
// Resolve nav hrefs from sub-pages (e.g. tools/delimiter/) back to home anchors.
// ----------------------------------------------------------------------------
window.resolveNavHref = function (href, basePath, homeHref) {
  if (!href) return "#";
  if (href.charAt(0) === "#") {
    return basePath ? homeHref + href : href;
  }
  return basePath + href;
};

// ----------------------------------------------------------------------------
// Shared header markup — used by tools.html, guides.html, tool sub-pages.
// Returns the full <nav> markup matching the design's mono-style nav.
// All styling is in css/style.css (.tf-nav classes).
// ----------------------------------------------------------------------------
window.renderHeader = function (options) {
  options = options || {};
  const basePath = options.basePath || "";
  const homeHref = options.homeHref || basePath + "index.html";
  const stylesHref = basePath + "css/style.css";
  const hrefExpr = `window.resolveNavHref(link.href, '${basePath}', '${homeHref}')`;

  return `
    <link rel="stylesheet" href="${stylesHref}">
    <nav class="tf-nav">
      <a href="${homeHref}" class="tf-nav__brand">
        <span class="tf-nav__dot"></span>
        <span class="tf-nav__name">TACTFORCE</span>
        <span class="tf-nav__ver">/ v2026</span>
      </a>
      <ul class="tf-nav__list">
        <template x-for="link in content.navigation" :key="link.label">
          <li>
            <a :href="${hrefExpr}" class="tf-nav__link" x-text="link.label"></a>
          </li>
        </template>
      </ul>
      <div style="display:flex; align-items:center; gap:14px;">
        <span class="tf-nav__time tf-hide-mobile" data-utc>--:--:-- UTC</span>
        <button @click="toggleTheme()" class="tf-nav__icon-btn" :title="darkMode ? 'Switch to Light' : 'Switch to Dark'" aria-label="Toggle theme">
          <svg x-show="!darkMode" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg x-show="darkMode" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </button>
        <button @click="toggleMenu()" class="tf-nav__icon-btn tf-burger" aria-label="Toggle menu">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </nav>
    <div class="tf-mobile-panel" :class="{ 'tf-open': mobileMenuOpen }">
      <ul class="tf-mobile-list">
        <template x-for="link in content.navigation" :key="link.label">
          <li>
            <a :href="${hrefExpr}" @click="toggleMenu()" class="tf-mobile-link" x-text="link.label"></a>
          </li>
        </template>
      </ul>
    </div>
  `;
};

// Boot log
document.addEventListener("DOMContentLoaded", () => {
  console.log("TactForce v2026 — console mode initialized");
});
