/**
 * Workspace-shared utilities every new app in the workspace can import from
 * `./workspace-toolkit`. Kept intentionally tiny for the demo; a real
 * workspace might put its design system entry, its API client, its logger,
 * or its analytics wrapper here so every app gets them for free without
 * copying boilerplate.
 */

export function greet(name) {
  return `Hey ${name} — welcome to your workspace-scaffolded app 👋`;
}
