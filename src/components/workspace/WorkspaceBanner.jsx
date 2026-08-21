// A component every app in this workspace starts with — proof the template's
// own code (not just the platform scaffold) reached the app.
export function WorkspaceBanner() {
  return (
    <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '8px 16px', fontSize: 13, textAlign: 'center' }}>
      Built from the <strong>demo</strong> workspace template
    </div>
  );
}
