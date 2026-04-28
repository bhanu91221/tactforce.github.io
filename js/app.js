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

  // Mixins shared by index/tools/guides
  const navMixin = {
    mobileMenuOpen: false,
    appsDropdownOpen: false,
    toggleMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; },
    toggleAppsDropdown() { this.appsDropdownOpen = !this.appsDropdownOpen; },
    closeAppsDropdown() { this.appsDropdownOpen = false; },
  };

  // Index page
  Alpine.data("site", () => ({
    ...siteStore,
    ...navMixin,
    contactSent: false,
  }));

  // Tools page
  Alpine.data("toolsApp", () => ({
    ...siteStore,
    ...navMixin,
    get visibleTools() {
      return (this.content.tools || []).filter((t) => !t.hidden);
    },
  }));

  // Guides page
  Alpine.data("guideApp", () => ({
    ...siteStore,
    ...navMixin,
    id: new URLSearchParams(window.location.search).get("id"),
    guideDropdownOpen: false,
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
// Live local clock — updates any element with [data-utc] every second.
// ----------------------------------------------------------------------------
const LOCAL_TZ = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" })
  .formatToParts(new Date())
  .find((p) => p.type === "timeZoneName")?.value ?? "";

function tickClock() {
  const els = document.querySelectorAll("[data-utc]");
  if (!els.length) return;
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const txt = `${hh}:${mm}:${ss} ${LOCAL_TZ}`;
  els.forEach((el) => { el.textContent = txt; });
}
setInterval(tickClock, 1000);
document.addEventListener("DOMContentLoaded", tickClock);

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
// Resolve nav hrefs to home page when needed.
// - On index.html: anchor stays as `#section`
// - On any non-index page (tools.html, guides.html, tool sub-pages, admin):
//   `#section` resolves to `<homeHref>#section` so the link still works.
// renderHeader() is only called on non-index pages, so we always prepend.
// ----------------------------------------------------------------------------
window.resolveNavHref = function (href, basePath, homeHref) {
  if (!href) return "#";
  if (href.charAt(0) === "#") return homeHref + href;
  return basePath + href;
};

// ----------------------------------------------------------------------------
// Smooth scroll any in-page anchor click, accounting for fixed-nav offset.
// ----------------------------------------------------------------------------
document.addEventListener("click", function (e) {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href").slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const navOffset = 70;
  const top = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
  window.scrollTo({ top, behavior: "smooth" });
  if (history.replaceState) history.replaceState(null, "", "#" + id);
});

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
  const productHrefExpr = `window.resolveNavHref('#' + p.id, '${basePath}', '${homeHref}')`;

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
            <template x-if="link.dropdown === 'products'">
              <div @click.away="closeAppsDropdown()">
                <button class="tf-nav__link" :class="{ 'is-open': appsDropdownOpen }" @click="toggleAppsDropdown()">
                  <span x-text="link.label"></span>
                  <span class="caret">▾</span>
                </button>
                <div class="tf-nav__menu" x-show="appsDropdownOpen" x-transition style="display:none;">
                  <template x-for="p in content.products" :key="p.id">
                    <div>
                      <a :href="${productHrefExpr}" @click="closeAppsDropdown()" class="tf-nav__menu-item">
                        <span x-text="p.name"></span>
                        <span class="meta" x-text="(p.tagline || '')"></span>
                      </a>
                      <div class="tf-nav__menu-sub">
                        <a :href="p.appExchangeLink" target="_blank" rel="noreferrer" @click="closeAppsDropdown()">AppExchange ↗</a>
                        <a :href="window.resolveNavHref(p.guideLink, '${basePath}', '${homeHref}')" @click="closeAppsDropdown()">Setup Guide</a>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
            <template x-if="!link.dropdown">
              <a :href="${hrefExpr}" class="tf-nav__link" x-text="link.label"></a>
            </template>
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
