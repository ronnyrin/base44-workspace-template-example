# Example workspace app template — repo-owned Dockerfile.
#
# Base44 picks this file up (default name: Dockerfile) and uses it verbatim.
# Override the filename via `"dockerfile": "..."` in base44.template.json if
# you need something else. When the file is absent, Base44 falls back to a
# generated Dockerfile derived from `install_command`.
#
# Two things you MUST keep even when customizing:
#
# 1. `WORKDIR /app` + `COPY . /app/` — the runtime overlay assumes the app
#    source lives at /app.
# 2. The scaffold-manifest snapshot BEFORE the install step. It captures the
#    list of paths that came from your baked scaffold so the runtime can strip
#    them cleanly when a user edits a file in the app. Snapshot after any
#    source copy but before `npm ci` — otherwise node_modules leaks into it.
#
# Everything else (base image, system deps, build args) is yours to change.

FROM node:20-slim

WORKDIR /app
COPY . /app/

# Scaffold snapshot — see comment above. `src` here matches `code_root` in
# base44.template.json; keep them in sync when you rename the source dir.
RUN mkdir -p /managed && find "src" -mindepth 1 -printf '%P\n' > /managed/scaffold-manifest.txt

RUN npm ci
