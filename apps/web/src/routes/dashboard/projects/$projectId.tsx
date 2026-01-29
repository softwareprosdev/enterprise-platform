import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/projects/$projectId')({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { projectId } = Route.useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Project Details</h1>
      <p>Project ID: {projectId}</p>
      <p className="text-muted-foreground mt-4">Project detail page coming soon...</p>
    </div>
  );
}
