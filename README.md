# Base44 workspace template — example

This repo is an example of what a **Base44 workspace app template** looks like.
Point a workspace's App Template configuration at this repo (via
`Workspace Settings → App template → Configure`) and every new app in that
workspace will boot from an image built on top of it.

The full design lives in the B4P doc → "Workspace App Templates — Design" tab.

## What Base44 does with this repo

At each build:

1. Clones the repo at the workspace's configured ref (default: `main`).
2. Reads [`base44.template.json`](./base44.template.json) for the manifest —
   `code_root`, `install_command`, `build_command`, `start_command`, `port`.
3. Composes a Dockerfile that:
   ```
   FROM base44/managed-runtime-base:vN
   COPY --from=repo /clone /app
   RUN find "${code_root}" -mindepth 1 -printf '%P\n' > /managed/scaffold-manifest.txt
   RUN ${install_command}
   ```
4. Content-hashes `(source_sha, lockfile_hash)` → tags the image `ca-<hash>`
   → pushes to `base44/workspaces/<workspace_id>` in ECR.
5. On promote-to-stable: every new app in the workspace boots from that image.

## Repo layout

```
.
├── base44.template.json    # the manifest — this is the load-bearing file
├── package.json            # Vite + React 18
├── vite.config.js
├── index.html
└── src/                    # everything here is code_root — travels per-app
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   └── WorkspaceBanner.jsx
    └── workspace-toolkit/
        └── index.js        # shared utilities every new app can import
```

`code_root: "src"` in the manifest means everything under `src/` is
"workspace-shared code the app author sees and can edit in their app."
Everything outside (`package.json`, `vite.config.js`, `node_modules`) is baked
into the image and not part of the app's per-app file tree.

## How to test it end-to-end

1. In the workspace where you want to try this, enable the
   `WORKSPACE_APP_TEMPLATES` PostHog flag for yourself (or use the temp
   force-on commit on the PR branch).
2. Go to `Workspace Settings → App template → Configure app template`.
3. URL: `https://github.com/ronnyrin/base44-workspace-template-example`, ref: `main`.
4. Save. Ready summary appears.
5. Click **Trigger build**. Watch `last_build.status` cycle through
   `queued → cloning → installing → snapshotting → pushing → done`.
6. If it lands `done`, promote to `stable` if it isn't already.
7. Create a new app. When the "Booted from the example workspace template"
   purple banner shows up in the preview, the pipeline works end-to-end.

## Customizing this for your own workspace

Fork this repo, then change:

- **`src/components/WorkspaceBanner.jsx`** — the visible tell. Replace with
  your team's branding / design system landing.
- **`src/workspace-toolkit/`** — swap the toy `greet` export for whatever
  shared code your workspace apps should get for free (API client, design
  system entry, analytics wrapper, feature-flag reader, etc.).
- **`package.json`** — add your workspace's runtime dependencies. Every new
  app in the workspace boots with these already installed.
- **`base44.template.json`** — the manifest fields let you swap Vite for
  another runner, or point `code_root` at a different directory.

## What lives here vs. in a per-app FileTree

| Where | What |
|---|---|
| **This repo** | Runtime, deps, shared code, common layouts, design system, workspace utilities. Baked into the image; changes only via a new build. |
| **Per-app FileTree in Base44's DB** | Everything the app author writes or the builder agent produces after app creation. Diverges freely; the image below stays frozen at whatever the app was created against. |

Anything under `code_root` in this repo is the **starting file tree** — copied
into each new app's FileTree on creation. The app author can edit those files
freely from there; the workspace image doesn't know or care.
