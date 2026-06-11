// Local dev server that serves the static site AND runs api/chat.js.
// Run with: node dev.js  (or `npm run dev`)
// Reads .env for ANTHROPIC_API_KEY.

import { createServer } from 'node:http';
import { readFile, readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { promisify } from 'node:util';

const readFileAsync = promisify(readFile);
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));
// After Eleventy build, static files live in _site/
const ROOT = path.join(PROJECT_ROOT, '_site');
const PORT = Number(process.env.PORT) || 8000;

// ─── Load .env into process.env ───────────────────────────
try {
  const envText = readFileSync(path.join(PROJECT_ROOT, '.env'), 'utf8');
  for (const raw of envText.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(k in process.env)) process.env[k] = v;
  }
} catch (e) {
  console.warn('[dev] .env not loaded:', e.message);
}

// ─── Import the chat handler (after env is loaded) ────────
const { default: chatHandler } = await import(path.join(PROJECT_ROOT, 'api/chat.js'));

// ─── MIME types ───────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// ─── Vercel-style adapter so api/chat.js works unchanged ──
async function callChatHandler(req, res) {
  // Collect body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  try { req.body = raw ? JSON.parse(raw) : null; } catch { req.body = null; }

  // Vercel-style helpers
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => {
    if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(obj));
    return res;
  };

  try {
    await chatHandler(req, res);
  } catch (err) {
    console.error('[dev] handler crashed:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err?.message || 'internal error' }));
    }
  }
}

// ─── Static file handler ──────────────────────────────────
async function serveStatic(req, res) {
  let pathname = decodeURIComponent(req.url.split('?')[0]);
  // Trailing slash / index
  if (pathname === '/' || pathname.endsWith('/')) pathname += 'index.html';
  // Default to .html when extension missing (clean URLs)
  if (!path.extname(pathname) && existsSync(path.join(ROOT, pathname + '.html'))) {
    pathname += '.html';
  }

  const filePath = path.join(ROOT, pathname);
  // Block path traversal
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.statusCode = 404;
    try {
      const notFound = await readFileAsync(path.join(ROOT, '404.html'));
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(notFound);
    } catch {
      return res.end('Not Found');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache');  // always fresh in dev
  const buf = await readFileAsync(filePath);
  res.end(buf);
}

// ─── Router ───────────────────────────────────────────────
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/api/chat') {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Allow', 'POST');
        return res.end('Method Not Allowed');
      }
      return callChatHandler(req, res);
    }
    return serveStatic(req, res);
  } catch (err) {
    console.error('[dev] router error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
});

server.listen(PORT, () => {
  const hasKey = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 20);
  console.log(`\n  Bernd dev server`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → /api/chat  ${hasKey ? '✓ key loaded' : '✗ ANTHROPIC_API_KEY missing in .env'}`);
  console.log(`  Model: ${process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001'}\n`);
});
