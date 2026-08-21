import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite defaults tuned for Base44 workspace-template apps: bind on 0.0.0.0 so
// the E2B/Modal sandbox's forwarded port reaches the dev server, and match
// the port declared in base44.template.json.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
