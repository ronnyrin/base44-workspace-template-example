# Workspace app source — simple client

A deliberately plain client-side app used to exercise Base44 workspace app
sources outside the Vite/React scaffold: no framework, no bundler, no
runtime dependencies.

    public/            the app (index.html + assets/), served as-is
    scripts/serve.mjs  dev server (node stdlib), binds --host/--port
    scripts/build.mjs  "build" = copy public/ to dist/

`base44/config.jsonc` is the build contract. It is the Base44 CLI's own project
config, deliberately: a repo that has ever been a Base44 app already declares
how it installs, builds and serves, so making it a source needs no extra file.
Only the `site` block is read, and only these keys:

    installCommand    must be a lockfile-exact `npm install`
    buildCommand      must be `npm run <script>`
    serveCommand      must be `npm run <script>`; the sandbox appends
                      `-- <devHostFlag> 0.0.0.0 --port <n>`
    outputDirectory   relative to the app root, must hold a root index.html
    devHostFlag       optional, defaults to `--host`; `--hostname` for Next,
                      which exits on `--host`

A repo carrying no config gets the defaults for all of them. `--port` is not
configurable — the sandbox picks it and the dev-server kill matcher scopes
itself to that port.

The repo's *shape* is not declared: Base44 detects that this isn't the standard
scaffold (no `src/App.jsx`) and stamps `platform_scaffold: false` itself,
overwriting anything the config claimed. Apps from a non-scaffold source lose
the surfaces that assume that shape — page discovery, path categorization, and
the editor's build-status, HMR and visual-edit integrations — and skip the
scaffold-only boot codemods.
