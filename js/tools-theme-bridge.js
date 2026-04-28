// Sync site theme with tool sub-pages BEFORE Alpine boots — prevents flash.
// Sets [data-theme="dark|light"] on <html>; tools' existing [data-theme="dark"] CSS keeps working.
// Mirrors the .dark Tailwind class so legacy `dark:` utilities in tools also work.
(function () {
  var saved = localStorage.getItem("theme");
  // Site default is dark unless user explicitly chose light.
  var isDark = saved !== "light";
  var root = document.documentElement;
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  root.classList.toggle("dark", isDark);

  // Keep attr in sync if anything later flips the .dark class (Alpine toggle).
  new MutationObserver(function () {
    var dark = root.classList.contains("dark");
    root.setAttribute("data-theme", dark ? "dark" : "light");
  }).observe(root, { attributes: true, attributeFilter: ["class"] });
})();
