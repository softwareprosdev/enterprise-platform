import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-4xl w-full p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to Villa Homes</h1>
        <p className="text-muted-foreground">Onboarding flow coming soon...</p>
      </div>
    </div>
  );
}
