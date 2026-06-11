(function () {
  const root = document.getElementById('chat-root');
  if (!root) return;

  const launch = root.querySelector('.chat-launch');
  const panel = root.querySelector('.chat-panel');
  const closeBtn = root.querySelector('.chat-close');
  const form = root.querySelector('.chat-form');
  const input = form.querySelector('input[name="msg"]');
  const messagesEl = root.querySelector('.chat-messages');

  if (!launch || !panel || !form || !input || !messagesEl) return;

  const history = [];
  let greeted = false;

  const open = () => {
    panel.classList.add('is-open');
    launch.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      appendMsg(
        'assistant',
        "Hi — ask anything about Bernd's services, focus areas, or engagement history. Replies are AI-generated."
      );
      greeted = true;
    }
    setTimeout(() => input.focus(), 220);
  };
  const close = () => {
    panel.classList.remove('is-open');
    launch.setAttribute('aria-expanded', 'false');
  };

  launch.addEventListener('click', () => {
    panel.classList.contains('is-open') ? close() : open();
  });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
  });

  function appendMsg(role, text) {
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg-' + role;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.disabled = true;

    appendMsg('user', text);
    history.push({ role: 'user', content: text });

    const loader = appendMsg('assistant', '…');
    loader.classList.add('chat-loading');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      loader.remove();
      if (!res.ok) {
        const detail = data && data.error ? data.error : 'Request failed';
        throw new Error(detail);
      }
      const reply = (data && data.reply) || '';
      appendMsg('assistant', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      loader.remove();
      appendMsg(
        'assistant',
        "Sorry — the chat is currently unavailable. For direct contact, email bk@transion.org."
      );
      // eslint-disable-next-line no-console
      console.error('[chat]', err);
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
})();
