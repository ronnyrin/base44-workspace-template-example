/**
 * Base44 platform client — server-side.
 *
 * The Vite template ships a browser `@base44/sdk` wrapper. Server-side we
 * skip the SDK on purpose:
 *
 *   1. `@base44/sdk` targets the browser (URL-params + localStorage for
 *      auth); its shape doesn't cleanly translate to a Node process.
 *   2. Server-side workspace-baked runtimes are typically machine-to-machine
 *      — they need a small, boring fetch wrapper with the two env-injected
 *      values, not a full auth/SDK layer.
 *
 * This module exposes just enough surface to prove the wire works:
 *
 *   const client = createBase44Client();
 *   const info = await client.appInfo();     // GET  /api/apps/{app_id}
 *   const rows = await client.entity('todos').list();  // GET  /api/apps/{app_id}/entities/todos
 *   await client.entity('todos').create({ title: 'hi' });  // POST ^
 *
 * A real workspace would replace this with its own client (auth against
 * a workspace API key, retries, observability). This file is a starting
 * point, not a library.
 */

import { readAppParams, type AppParams } from './appParams.js';

export interface Base44Client {
  readonly params: AppParams;
  appInfo(): Promise<unknown>;
  entity(name: string): EntityClient;
}

export interface EntityClient {
  list<T = unknown>(): Promise<T[]>;
  create<T = unknown>(body: T): Promise<T>;
}

export function createBase44Client(params: AppParams = readAppParams()): Base44Client {
  const base = params.baseUrl.replace(/\/$/, '');
  const appPath = `/api/apps/${encodeURIComponent(params.appId)}`;

  async function call(path: string, init?: RequestInit): Promise<unknown> {
    if (!params.appId || !params.baseUrl) {
      throw new Error(
        'Base44 client is not wired: APPER_APP_ID / APPER_APP_BASE_URL missing from process env.',
      );
    }
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Base44 ${init?.method ?? 'GET'} ${path} failed: ${response.status}`);
    }
    return response.json();
  }

  return {
    params,
    appInfo: () => call(appPath),
    entity: (name) => ({
      list: <T = unknown>() =>
        call(`${appPath}/entities/${encodeURIComponent(name)}`) as Promise<T[]>,
      create: <T = unknown>(body: T) =>
        call(`${appPath}/entities/${encodeURIComponent(name)}`, {
          method: 'POST',
          body: JSON.stringify(body),
        }) as Promise<T>,
    }),
  };
}
