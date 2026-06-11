// Vercel Function: GitHub OAuth proxy for Decap CMS.
//
// Flow:
//   1. Bernd clicks "Login with GitHub" in Decap CMS.
//   2. Decap opens a popup to /api/oauth?action=auth → we redirect to GitHub.
//   3. GitHub redirects back to /api/oauth?action=callback&code=...
//   4. We exchange the code for an access token (using the client secret).
//   5. We post the token back to the parent window via postMessage.
//   6. Decap stores the token and uses it to read/write the repo.
//
// Requires env vars (set in Vercel → Project → Settings → Environment Variables):
//   - GITHUB_OAUTH_CLIENT_ID
//   - GITHUB_OAUTH_CLIENT_SECRET
//
// See README.md → "Decap CMS setup" for the GitHub OAuth App configuration.

import { randomBytes } from 'node:crypto';

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = new URL(req.url, `${proto}://${host}`);
  const action = url.searchParams.get('action');

  const CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        error:
          'GITHUB_OAUTH_CLIENT_ID and/or GITHUB_OAUTH_CLIENT_SECRET are missing on the server. ' +
          'Set them in Vercel → Settings → Environment Variables. See README.md.',
      })
    );
  }

  // ─── Step 1: start the OAuth flow ──────────────────────────
  if (action === 'auth') {
    const state = randomBytes(16).toString('hex');
    const redirectUri = `${proto}://${host}/api/oauth?action=callback`;
    const authUrl =
      'https://github.com/login/oauth/authorize?' +
      new URLSearchParams({
        client_id: CLIENT_ID,
        scope: 'repo,user',
        state,
        redirect_uri: redirectUri,
      }).toString();
    res.statusCode = 302;
    res.setHeader('Location', authUrl);
    return res.end();
  }

  // ─── Step 2: exchange code for access token ────────────────
  if (action === 'callback') {
    const code = url.searchParams.get('code');
    if (!code) {
      res.statusCode = 400;
      return res.end('No code provided by GitHub.');
    }

    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenRes.json();

      if (data.error || !data.access_token) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: data.error_description || data.error || 'No access_token returned by GitHub.' }));
      }

      const payload = JSON.stringify({ token: data.access_token, provider: 'github' });
      const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Signing in…</title></head>
<body style="font-family:-apple-system,sans-serif;padding:2rem;color:#1d1d1f;">
  <p>Signed in successfully. You can close this window.</p>
  <script>
    (function () {
      var received = false;
      function send(e) {
        if (received) return;
        received = true;
        window.opener.postMessage(
          'authorization:github:success:' + ${JSON.stringify(payload)},
          e.origin
        );
      }
      window.addEventListener('message', send, false);
      window.opener.postMessage('authorizing:github', '*');
    })();
  </script>
</body></html>`;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(html);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: err?.message || 'OAuth exchange failed.' }));
    }
  }

  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ error: 'Unknown action. Use ?action=auth or ?action=callback.' }));
}
