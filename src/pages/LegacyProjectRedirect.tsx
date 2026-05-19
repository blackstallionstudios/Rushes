import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Compatibility shim for /project/:projectId links sent before the
 * share-token migration. Resolves the legacy ID to the project's current
 * share token and redirects.
 *
 * Remove this route on or after 2026-06-17 (30 days after the migration cutover).
 */
export default function LegacyProjectRedirect() {
  const { projectId } = useParams<{ projectId: string }>();
  const shareToken = useQuery(
    api.projects.getShareTokenForLegacyProjectId,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  if (shareToken === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Resolving link…</span>
      </div>
    );
  }

  if (shareToken === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-ink-muted">
        <h1 className="text-3xl font-display text-gold mb-3">Rushes</h1>
        <p>This link is invalid or has been revoked.</p>
      </div>
    );
  }

  return <Navigate to={`/share/${shareToken}`} replace />;
}
