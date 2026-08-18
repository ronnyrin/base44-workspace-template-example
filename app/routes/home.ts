import { workspaceBanner } from '../lib/branding.js';

/**
 * The home route — one function that returns the full page HTML.
 * Kept side-effect-free so it's easy to unit-test or replace.
 */
export function renderHome(): string {
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
  </body>
</html>
`;
}
