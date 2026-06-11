// main.js — entry point. Individual modules self-initialize.
// Reserved for future shared init (e.g. analytics, after-consent loaders).
(function () {
  // Year in footer (if a [data-year] node exists)
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
