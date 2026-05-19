import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ClientView from "../components/ClientView";

export default function ProjectPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const project = useQuery(
    api.projects.getProjectByShareToken,
    shareToken ? { shareToken } : "skip"
  );

  if (project === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading project…</span>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-ink-muted">
        <h1 className="text-3xl font-display text-gold mb-3">Rushes</h1>
        <p>This link is invalid or has been revoked.</p>
      </div>
    );
  }

  return <ClientView project={project} />;
}
