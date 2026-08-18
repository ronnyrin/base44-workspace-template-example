import { createServer } from 'node:http';
import { renderHome } from './routes/home.js';
import { readAppParams, isBase44Wired } from './lib/appParams.js';

/**
 * Main entry — a plain Node HTTP server, no framework, no bundler.
 *
 * This repo is a Base44 workspace-template example. Everything under `app/`
 * (the `code_root` in base44.template.json) travels with each new app in the
 * workspace; every request lands here first. The workspace image bakes the
 * TypeScript build output into `dist/` — `npm start` runs the compiled JS.
 *
 * Routes:
 *   GET /        — home page (HTML)
 *   GET /health  — liveness probe (JSON)
 *   GET /api/whoami — echoes the injected APPER_APP_ID + APPER_APP_BASE_URL
 */

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  if (url.pathname === '/api/whoami') {
    const params = readAppParams();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        wired: isBase44Wired(params),
        app_id: params.appId,
        base_url: params.baseUrl,
      }),
    );
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderHome());
});

server.listen(PORT, '0.0.0.0', () => {
  const params = readAppParams();
  // eslint-disable-next-line no-console
  console.log(
    `workspace-template example listening on http://0.0.0.0:${PORT}` +
      (isBase44Wired(params) ? ` (wired to app ${params.appId})` : ' (Base44 env not injected)'),
  );
});
