import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/tasks')({
  component: Tasks,
});

function Tasks() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <p className="text-muted-foreground mt-4">Tasks page coming soon...</p>
    </div>
  );
}
