import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import ClientView from "../components/ClientView";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  if (project === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-ink-muted">
        <h1 className="text-3xl font-display text-gold mb-3">Rushes</h1>
        <p>Project not found.</p>
      </div>
    );
  }

  return <ClientView project={project} />;
}
