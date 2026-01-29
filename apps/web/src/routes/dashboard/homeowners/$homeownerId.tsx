import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/homeowners/$homeownerId')({
  component: HomeownerDetail,
});

function HomeownerDetail() {
  const { homeownerId } = Route.useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Homeowner Details</h1>
      <p>Homeowner ID: {homeownerId}</p>
      <p className="text-muted-foreground mt-4">Homeowner detail page coming soon...</p>
    </div>
  );
}
