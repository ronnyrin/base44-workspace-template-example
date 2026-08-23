# Workspace template — simple client

A deliberately plain client-side app used to exercise Base44 workspace app
templates outside the Vite/React scaffold: no framework, no bundler, no
runtime dependencies.

    public/            the app (index.html + assets/), served as-is
    scripts/serve.mjs  dev server (node stdlib), binds --host/--port
    scripts/build.mjs  "build" = copy public/ to dist/

`base44.template.json` declares only what Base44 cannot work out for itself:
where the editable code lives and how to install, start and build it. The
repo's *shape* is not declared — Base44 detects that it isn't the standard
scaffold (no `src/App.jsx`) and reports it on the template's settings card.
Apps from a non-scaffold template lose the surfaces that assume that shape:
page discovery, path categorization, and the editor's build-status, HMR and
visual-edit integrations.
