// Expose content to Alpine.js
// Shared Alpine Store and Logic
document.addEventListener("alpine:init", () => {
  // Shared Store Logic
  const siteStore = {
    content: window.siteContent,
    darkMode: false,

    init() {
      // Default to Dark Mode if no preference is saved
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        this.darkMode = true;
      } else if (savedTheme === "light") {
        this.darkMode = false;
      } else {
        // Default to Dark Mode
        this.darkMode = true;
        localStorage.setItem("theme", "dark");
      }
      this.updateTheme();
    },

    toggleTheme() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("theme", this.darkMode ? "dark" : "light");
      this.updateTheme();
    },

    updateTheme() {
      if (this.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  };

  // Index Page Data
  Alpine.data("site", () => ({
    ...siteStore,
    mobileMenuOpen: false,
    solutionsDropdownOpen: false,
    toggleMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    scrollToProduct(productId) {
      const element = document.getElementById(productId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      this.solutionsDropdownOpen = false;
      this.mobileMenuOpen = false;
    },
  }));

  // Tools Page Data
  Alpine.data("toolsApp", () => ({
    ...siteStore,
    mobileMenuOpen: false,
    solutionsDropdownOpen: false,
    toggleMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    get visibleTools() {
      return (this.content.tools || []).filter((t) => !t.hidden);
    },
  }));

  // Guides Page Data
  Alpine.data("guideApp", () => ({
    ...siteStore,
    id: new URLSearchParams(window.location.search).get("id"),
    guideDropdownOpen: false,
    get currentGuide() {
      return this.content.guides[this.id];
    },
    get availableGuides() {
      return Object.entries(this.content.guides).map(([key, guide]) => ({
        id: key,
        title: guide.title,
      }));
    },
    navigateToGuide(guideId) {
      window.location.href = `guides.html?id=${guideId}`;
    },
    init() {
      siteStore.init.call(this); // Call shared init
      if (!this.currentGuide && this.id) {
        console.error("Guide not found");
      }
    },
  }));
});

// Smooth Scroll (Lenis) - Loaded via CDN in index.html, initialized here if window.Lenis exists
// Smooth Scroll (Lenis) - DISABLED for performance. Using native CSS scroll-behavior: smooth
const initSmoothScroll = () => {
  // Native smooth scrolling is handled by 'scroll-smooth' class on <html> tag
  console.log("Using native smooth scrolling");
};

// Scroll Reveal Animation
const initScrollReveal = () => {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Check only once
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => {
    observer.observe(el);
  });
};

window.initScrollReveal = initScrollReveal;

// Resolve a navigation link's href relative to the current page.
// - "#section" anchors from a subpage -> "<homeHref>#section" (jump back to home + anchor)
// - "#section" from the home page itself -> stays "#section"
// - "page.html" path -> "<basePath>page.html"
window.resolveNavHref = function (href, basePath, homeHref) {
  if (!href) return "#";
  if (href.charAt(0) === "#") {
    return basePath ? homeHref + href : href;
  }
  return basePath + href;
};

// Shared header markup for new pages (tools.html, tool subpages).
// basePath is prefixed to asset URLs so subpages like /tools/delimiter/ can resolve them.
// homeHref is where the logo + anchor links point to (use a relative or absolute path).
//
// IMPORTANT: this header uses inline CSS (not Tailwind classes) because Tailwind's
// CDN JIT compiler doesn't reliably pick up classes on HTML injected via innerHTML
// after the initial DOM scan. Inline styles work regardless of Tailwind's state.
window.renderHeader = function (options) {
  options = options || {};
  const basePath = options.basePath || "";
  const homeHref = options.homeHref || basePath + "index.html";
  const hrefExpr = `window.resolveNavHref(link.href, '${basePath}', '${homeHref}')`;
  return `
    <style>
      .tf-nav { max-width: 80rem; margin: 0 auto; padding: 1rem 1.5rem; }
      .tf-nav-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
      .tf-logo-link { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
      .tf-logo-img { width: 56px; height: 56px; object-fit: contain; transition: transform 0.2s; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
      .tf-logo-link:hover .tf-logo-img { transform: scale(1.1); }
      .tf-logo-text { font-size: 1.25rem; font-weight: 700; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.4); }
      .tf-nav-list { display: flex; align-items: center; gap: 2rem; list-style: none; margin: 0; padding: 0; }
      .tf-nav-link { color: #fff; font-weight: 500; text-decoration: none; transition: color 0.2s; }
      .tf-nav-link:hover { color: #bfdbfe; }
      .tf-icon-btn { background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 9999px; color: #fff; display: inline-flex; align-items: center; justify-content: center; transition: background-color 0.2s; }
      .tf-icon-btn:hover { background: rgba(255,255,255,0.12); }
      .tf-burger { display: none; }
      .tf-mobile-panel { display: none; background: rgba(255,255,255,0.08); backdrop-filter: blur(8px); }
      .tf-mobile-panel.tf-open { display: block; }
      .tf-mobile-list { list-style: none; margin: 0; padding: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem; align-items: stretch; }
      .tf-mobile-link { display: block; text-align: center; padding: 0.5rem 1rem; color: #fff; text-decoration: none; transition: color 0.2s; }
      .tf-mobile-link:hover { color: #bfdbfe; }
      /* Scrolled state — applied by scroll handler in each page */
      #main-header.tf-scrolled { background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
      :root.dark #main-header.tf-scrolled { background: rgba(17,24,39,0.92); }
      #main-header.tf-scrolled .tf-logo-text,
      #main-header.tf-scrolled .tf-nav-link,
      #main-header.tf-scrolled .tf-mobile-link,
      #main-header.tf-scrolled .tf-icon-btn { color: #1f2937; text-shadow: none; }
      :root.dark #main-header.tf-scrolled .tf-logo-text,
      :root.dark #main-header.tf-scrolled .tf-nav-link,
      :root.dark #main-header.tf-scrolled .tf-mobile-link,
      :root.dark #main-header.tf-scrolled .tf-icon-btn { color: #fff; }
      #main-header.tf-scrolled .tf-nav-link:hover,
      #main-header.tf-scrolled .tf-mobile-link:hover { color: #2563eb; }
      :root.dark #main-header.tf-scrolled .tf-nav-link:hover,
      :root.dark #main-header.tf-scrolled .tf-mobile-link:hover { color: #60a5fa; }
      @media (max-width: 767px) {
        .tf-nav-list { display: none; }
        .tf-burger { display: inline-flex; }
      }
    </style>
    <nav class="tf-nav">
      <div class="tf-nav-row">
        <a href="${homeHref}" class="tf-logo-link">
          <img src="${basePath}images/logo.png" alt="TactForce Logo" class="tf-logo-img" onerror="this.style.display='none'">
          <span class="tf-logo-text">TactForce</span>
        </a>
        <ul class="tf-nav-list">
          <li>
            <button @click="toggleTheme()" class="tf-icon-btn" :title="darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'" aria-label="Toggle theme">
              <svg x-show="!darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <svg x-show="darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            </button>
          </li>
          <template x-for="link in content.navigation">
            <li>
              <a :href="${hrefExpr}" class="tf-nav-link" x-text="link.label"></a>
            </li>
          </template>
        </ul>
        <button @click="toggleTheme()" class="tf-icon-btn tf-burger" aria-label="Toggle theme" style="margin-right:0.25rem;">
          <svg x-show="!darkMode" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg x-show="darkMode" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </button>
        <button @click="toggleMenu()" class="tf-icon-btn tf-burger" aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </nav>
    <div class="tf-mobile-panel" :class="{ 'tf-open': mobileMenuOpen }">
      <ul class="tf-mobile-list">
        <template x-for="link in content.navigation">
          <li>
            <a :href="${hrefExpr}" @click="toggleMenu()" class="tf-mobile-link" x-text="link.label"></a>
          </li>
        </template>
      </ul>
    </div>
  `;
};

// Start
document.addEventListener("DOMContentLoaded", () => {
  // Wait for external scripts if necessary, but DOMContentLoaded usually fine.
  // Lenis is loaded via script tag, might need a slight delay or check.
  setTimeout(initSmoothScroll, 100);
  initScrollReveal();
  console.log("TactForce App Initialized");
});
