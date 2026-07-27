(function () {
  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
  }

  fetch('/content.json')
    .then(r => r.json())
    .then(content => {
      document.querySelectorAll('[data-content]').forEach(el => {
        const key = el.dataset.content;
        const val = getNestedValue(content, key);
        if (val !== undefined && val !== null) {
          el.textContent = val;
        }
      });
    })
    .catch(() => {}); // silent fail — static content remains
})();
