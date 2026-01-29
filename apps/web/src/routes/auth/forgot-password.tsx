import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <p className="text-muted-foreground">Password reset page coming soon...</p>
      </div>
    </div>
  );
}
