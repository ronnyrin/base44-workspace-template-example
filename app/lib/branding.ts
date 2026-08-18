/**
 * Workspace-shared branding utilities.
 *
 * Every new app in the workspace inherits this module. A real workspace would
 * put its brand copy, its API client base URL, its logger, its feature-flag
 * reader — whatever the workspace's apps should agree on from t=0 — in a
 * module like this one.
 */

export function workspaceBanner(): string {
  return '🎨 Booted from the example workspace template';
}
