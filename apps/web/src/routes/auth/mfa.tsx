import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/mfa')({
  component: MFAPage,
});

function MFAPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-4">Multi-Factor Authentication</h1>
        <p className="text-muted-foreground">MFA verification page coming soon...</p>
      </div>
    </div>
  );
}
