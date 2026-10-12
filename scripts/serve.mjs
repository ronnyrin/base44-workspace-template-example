// Dev server for a plain client-side app. Node stdlib only — no framework,
// no bundler, no dependencies.
//
// Base44's sandbox launches this as `npm run dev -- --host 0.0.0.0 --port <n>`
// and may append flags of its own, so the argv scan reads the two it cares
// about and ignores everything else rather than erroring on an unknown flag.
import { createServer } from 'node:http';
import { readdirSync, watch } from 'node:fs';
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

// Live reload. The Base44 editor's preview bridge imports `/@vite/client` and
// listens for Vite's HMR events, so this serves a stand-in that speaks the
// same events over a server-sent event stream. Without it the editor reports
// the preview as broken and never refreshes it after an edit.
const HMR_CLIENT = `
const listeners = new Map();
const emit = (event) => (listeners.get(event) ?? []).map((listener) => listener());
let open = false;
const source = new EventSource('/__reload');
source.onopen = () => { open = true; emit('vite:ws:connect'); };
source.onerror = () => { if (open) { open = false; emit('vite:ws:disconnect'); } };
source.addEventListener('reload', async () => {
  // A listener that never settles hands the reload to the editor, which swaps in a fresh frame.
  await Promise.all(emit('vite:beforeFullReload'));
  location.reload();
});
export function createHotContext() {
  return {
    on(event, listener) {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
      if (event === 'vite:ws:connect' && open) listener();
    },
  };
}
`;

const clients = new Set();
let reloadTimer;
function reloadClients() {
  // One reload for a burst of writes, such as a save that touches several files.
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const client of clients) client.write('event: reload\ndata: {}\n\n');
  }, 100);
}
// Keeps proxies from closing the stream as idle.
setInterval(() => { for (const client of clients) client.write(': ping\n\n'); }, 25_000).unref();

// Each directory on its own: recursive watching isn't available on every Node and platform.
function watchTree(dir) {
  watch(dir, reloadClients);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) watchTree(join(dir, entry.name));
  }
}
watchTree(ROOT);

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/@vite/client') {
    res.writeHead(200, { 'Content-Type': TYPES['.js'], 'Cache-Control': 'no-store' });
    res.end(HMR_CLIENT);
    return;
  }
  if (url.pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' });
    // Sends the headers now, so the client's stream opens before the first reload.
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Client-side routing: anything without a file extension serves the shell.
  const rel = extname(url.pathname) ? url.pathname : '/index.html';
  // normalize() before join() so a crafted path can't climb out of public/.
  const file = join(ROOT, normalize(rel).replace(/^(\.\.[/\\])+/, ''));

  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      // The sandbox serves this over a generated preview host and reloads it
      // after every edit, so nothing may be cached.
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
