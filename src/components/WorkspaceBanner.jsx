/**
 * The tell that a workspace-configured runtime image is in use.
 * When you see this banner, the app was NOT booted from Base44's default
 * templates/apps_template — it came from this repo, baked into an image
 * on the workspace's ECR path.
 */
export function WorkspaceBanner() {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    >
      🎨 Booted from the example workspace template
    </div>
  );
}
