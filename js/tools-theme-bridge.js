// Syncs the parent site's `dark` class on <html> with the tool pages' `data-theme` attribute,
// so each tool's existing [data-theme="dark"] CSS keeps working unchanged.
// Runs before Alpine loads to prevent flash of wrong theme.
(function () {
  // Initial theme: mirror what siteStore.init() in app.js would pick.
  // Site default is dark if no preference is saved.
  var saved = localStorage.getItem("theme");
  var isDark = saved === "dark" || saved === null;
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  function sync() {
    var dark = document.documentElement.classList.contains("dark");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }
  sync();

  // Keep data-theme in sync whenever Alpine toggles the `dark` class.
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();
