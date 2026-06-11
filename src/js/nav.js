(function () {
  const burger = document.querySelector('.nav-burger');
  const mobile = document.querySelector('.nav-mobile');
  if (!burger || !mobile) return;

  const toggle = (open) => {
    const isOpen = typeof open === 'boolean' ? open : !mobile.classList.contains('is-open');
    mobile.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen) {
      mobile.removeAttribute('hidden');
    } else {
      // delay so transition can play
      setTimeout(() => {
        if (!mobile.classList.contains('is-open')) mobile.setAttribute('hidden', '');
      }, 300);
    }
  };

  burger.addEventListener('click', () => toggle());
  mobile.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') toggle(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobile.classList.contains('is-open')) toggle(false);
  });

  // Mark active nav link (skip lang-toggle so EN stays bold)
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links > a, .nav-mobile a').forEach((a) => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (href === '/' && (path === '/' || path === '/index.html'))) {
      a.classList.add('is-active');
    }
  });

  // DE/EN language toggle — DE is not yet wired
  document.querySelectorAll('.nav-lang-soon').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      // Brief inline feedback
      const original = a.textContent;
      a.textContent = 'soon';
      a.style.transition = 'opacity 0.2s';
      setTimeout(() => { a.textContent = original; }, 1400);
    });
  });
})();
