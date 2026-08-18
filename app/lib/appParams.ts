/**
 * Base44 app-params reader — server-side variant.
 *
 * Every workspace-baked app boots with two env vars auto-injected by
 * Base44's sandbox provider:
 *
 *   APPER_APP_ID         — the Base44 UserApp _id this container is booting.
 *   APPER_APP_BASE_URL   — the platform's base URL for this environment
 *                          (`settings.frontend_url` or `settings.platform_url`).
 *
 * Both are set for every launch, so a workspace-baked runtime always knows
 * (a) which app it is, and (b) which Base44 backend to call. Falling back
 * to `''` on a missing var keeps the process bootable in local dev; every
 * SDK call fails cleanly with "missing app id" instead of crashing at
 * import.
 *
 * This is the Node/server equivalent of the browser `app-params.js` that
 * ships in the default Vite template — same two values, resolved from
 * `process.env` instead of URL params + localStorage.
 */

export interface AppParams {
  appId: string;
  baseUrl: string;
}

export function readAppParams(): AppParams {
  return {
    appId: process.env.APPER_APP_ID ?? '',
    baseUrl: process.env.APPER_APP_BASE_URL ?? '',
  };
}

/** True once both APPER_APP_ID and APPER_APP_BASE_URL are populated. */
export function isBase44Wired(params: AppParams = readAppParams()): boolean {
  return Boolean(params.appId && params.baseUrl);
}
