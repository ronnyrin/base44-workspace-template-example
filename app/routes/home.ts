import { workspaceBanner } from '../lib/branding.js';
import { readAppParams, isBase44Wired } from '../lib/appParams.js';

/**
 * The home route — one function that returns the full page HTML.
 * Kept side-effect-free so it's easy to unit-test or replace.
 *
 * Surfaces the Base44 params (app id + base URL) that the workspace-baked
 * runtime received via env, so it's obvious at a glance whether the
 * platform injection is working.
 */
export function renderHome(): string {
  const params = readAppParams();
  const wired = isBase44Wired(params);
  const appIdDisplay = params.appId || '(missing — APPER_APP_ID not injected)';
  const baseUrlDisplay = params.baseUrl || '(missing — APPER_APP_BASE_URL not injected)';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Workspace template example</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 32px; max-width: 720px; margin: 0 auto; color: #111; }
      .banner {
        padding: 12px 16px; border-radius: 8px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white; font-weight: 600; letter-spacing: 0.2px;
      }
      h1 { margin-top: 28px; }
      p  { color: #555; line-height: 1.5; }
      code { background: #f2f2f2; padding: 2px 6px; border-radius: 4px; }
      dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin-top: 16px; }
      dt { font-weight: 600; color: #333; }
      dd { margin: 0; color: #555; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
      .wired  { color: #10b981; }
      .missing { color: #ef4444; }
    </style>
  </head>
  <body>
    <div class="banner">${workspaceBanner()}</div>
    <h1>Hello from a workspace-baked runtime</h1>
    <p>
      No Vite. No React. No bundler beyond <code>tsc</code>. This page is
      served by a plain Node HTTP server compiled from
      <code>app/server.ts</code>, and it's here to prove that Base44 workspace
      templates aren't tied to any particular framework — just to Node.
    </p>
    <p>
      Everything under <code>app/</code> is the workspace's
      <code>code_root</code>: it travels with every new app in the workspace.
      Everything outside (deps, build output, tooling) is baked into the
      image and stays out of the per-app FileTree.
    </p>

    <h2>Base44 platform wiring</h2>
    <p>
      The two env vars <code>APPER_APP_ID</code> +
      <code>APPER_APP_BASE_URL</code> are auto-injected by the sandbox
      provider on every boot, so a workspace-baked runtime always knows
      which app it is and which Base44 backend to call.
    </p>
    <dl>
      <dt>Status</dt>
      <dd class="${wired ? 'wired' : 'missing'}">${wired ? '✔ wired' : '✖ not wired'}</dd>
      <dt>APPER_APP_ID</dt>
      <dd>${escapeHtml(appIdDisplay)}</dd>
      <dt>APPER_APP_BASE_URL</dt>
      <dd>${escapeHtml(baseUrlDisplay)}</dd>
    </dl>
    <p>
      Server-side calls go through <code>app/lib/base44Client.ts</code> — a
      tiny fetch wrapper around those two values. On the browser side you
      would use <code>@base44/sdk</code> instead; the SDK is intentionally
      not on the server-side dep list.
    </p>
  </body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
