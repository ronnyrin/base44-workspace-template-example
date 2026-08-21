import { useState } from 'react';
import { WorkspaceBanner } from './components/WorkspaceBanner.jsx';
import { greet } from './workspace-toolkit/index.js';

/**
 * The app users of this workspace start from. Everything under `src/` travels
 * with each new app (per base44.template.json's `code_root: "src"`); the
 * workspace-toolkit + WorkspaceBanner give new apps a shared vocabulary from
 * their first render.
 */
export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 32 }}>
      <WorkspaceBanner />
      <h1 style={{ marginTop: 32 }}>{greet('there')}</h1>
      <p style={{ color: '#555' }}>
        You're looking at an app booted from a workspace-configured runtime
        image. Any code under <code>src/</code> is part of the workspace
        template; anything the user edits from here on is app-specific.
      </p>
      <button
        type="button"
        onClick={() => setCount((n) => n + 1)}
        style={{
          marginTop: 16,
          padding: '8px 16px',
          border: '1px solid #ccc',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Clicked {count} times
      </button>
    </main>
  );
}
