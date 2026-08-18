# Base44 workspace template — example

Example workspace template for **Base44 App Templates**. Point a workspace at
this repo (`Workspace Settings → App template → Configure`) and every new app
in that workspace boots from an image built on top of it.

**Not Vite. Not React. Not a bundler beyond `tsc`.** This template is a plain
Node HTTP server in TypeScript, on purpose — to demonstrate that Base44
workspace templates aren't tied to any particular framework. Any Node repo
shape works as long as it declares an `install_command` + `build_command` +
`start_command` + `port` in `base44.template.json`.

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
   RUN ${build_command}
   ```
4. Content-hashes `(source_sha, lockfile_hash)` → tags the image `ca-<hash>`
   → pushes to `base44/workspaces/<workspace_id>` in ECR.
5. Every new app in the workspace boots from that image, running
   `${start_command}` and serving on `${port}`.

## Repo layout

```
.
├── base44.template.json    # the manifest — this is the load-bearing file
├── package.json            # deps + build/start scripts
├── tsconfig.json           # rootDir: app, outDir: dist
└── app/                    # code_root — travels per-app
    ├── server.ts           # main entry (plain node:http)
    ├── routes/
    │   └── home.ts         # a route module
    └── lib/
        └── branding.ts     # workspace-shared utility
```

`code_root: "app"` in the manifest means everything under `app/` is
"workspace-shared code the app author sees and can edit in their app."
Everything outside (`package.json`, `tsconfig.json`, `node_modules`,
`dist/`) is baked into the image and not part of the app's per-app file
tree.

## Manifest

```json
{
  "code_root": "app",
  "install_command": "npm ci",
  "build_command": "npm run build",
  "start_command": "npm start",
  "port": 3000
}
```

Compare to a Vite/React workspace template — the ONLY thing that changes
in the manifest between them is the values. Same five fields, same
semantics, different shape entirely under the hood.

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

- **`app/lib/branding.ts`** — replace the toy `workspaceBanner()` with
  your team's real shared modules: API client, feature-flag reader,
  logger, analytics wrapper.
- **`app/server.ts` / `app/routes/`** — replace the "hello" surface with
  whatever runtime your workspace's apps should agree on from t=0.
- **`package.json`** — add your workspace's runtime dependencies. Every new
  app in the workspace boots with these already installed.
- **`base44.template.json`** — the manifest fields let you swap Node for
  a different Node framework (Fastify, Express, Next, Astro, …) or point
  `code_root` at a different directory.

## What lives here vs. in a per-app FileTree

| Where | What |
|---|---|
| **This repo** | Runtime, deps, shared code, common layouts, design system, workspace utilities. Baked into the image; changes only via a new build. |
| **Per-app FileTree in Base44's DB** | Everything the app author writes or the builder agent produces after app creation. Diverges freely; the image below stays frozen at whatever the app was created against. |

Anything under `code_root` in this repo is the **starting file tree** — copied
into each new app's FileTree on creation. The app author can edit those files
freely from there; the workspace image doesn't know or care.
