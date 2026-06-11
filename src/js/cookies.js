(function () {
  const STORAGE_KEY = 'cookieConsent';
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-ok');
  if (!banner || !acceptBtn) return;

  const show = () => { banner.hidden = false; };
  const hide = () => { banner.hidden = true; };

  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      show();
    }
  } catch (e) {
    show();
  }

  acceptBtn.addEventListener('click', () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch (e) {}
    hide();
  });

  // Allow footer "Cookie Settings" link to reopen
  document.querySelectorAll('[data-reopen-cookies]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      try { localStorage.removeItem(STORAGE_KEY); } catch (e2) {}
      show();
    });
  });
})();
