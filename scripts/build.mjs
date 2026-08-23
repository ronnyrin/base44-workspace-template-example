// "Build" for a no-bundler app: copy public/ to dist/ so the platform has a
// static output directory to publish. Kept as a real script (rather than a
// shell cp) because the manifest's build_command must be an npm script.
import { cp, rm } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url).pathname;

await rm(`${ROOT}dist`, { recursive: true, force: true });
await cp(`${ROOT}public`, `${ROOT}dist`, { recursive: true });
console.log('built dist/ from public/');
