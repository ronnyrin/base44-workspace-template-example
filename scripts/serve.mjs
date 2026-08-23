// Dev server for a plain client-side app. Node stdlib only — no framework,
// no bundler, no dependencies.
//
// Base44's sandbox launches this as `npm run dev -- --host 0.0.0.0 --port <n>`
// and may append flags of its own, so the argv scan reads the two it cares
// about and ignores everything else rather than erroring on an unknown flag.
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { readFile } from 'node:fs/promises';

const ROOT = new URL('../public/', import.meta.url).pathname;

function flag(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const PORT = Number(flag('port', 5173));
const HOST = flag('host', '0.0.0.0');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  // Client-side routing: anything without a file extension serves the shell.
  const rel = extname(url.pathname) ? url.pathname : '/index.html';
  // normalize() before join() so a crafted path can't climb out of public/.
  const file = join(ROOT, normalize(rel).replace(/^(\.\.[/\\])+/, ''));

  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      // The sandbox serves this over a generated preview host, and the app is
      // reloaded by hand rather than by HMR, so nothing may be cached.
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    res.end('<!doctype html><title>404</title><h1>404</h1>');
  }
}).listen(PORT, HOST, () => {
  console.log(`serving public/ on http://${HOST}:${PORT}`);
});
