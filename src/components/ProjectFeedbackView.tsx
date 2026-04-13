import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import SmashDownloadButton from "./SmashDownloadButton";
import { formatDownloadExpiryNotice } from "../lib/downloadExpiry";

interface Props {
  projectId: Id<"projects">;
  onBack: () => void;
}

const STARS = [1, 2, 3, 4, 5];

export default function ProjectFeedbackView({ projectId, onBack }: Props) {
  const project = useQuery(api.projects.getProject, { projectId });
  const feedbackList = useQuery(api.feedback.listFeedback, { projectId }) ?? [];

  if (!project) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="text-ink-muted text-sm hover:text-gold transition-colors mb-6 flex items-center gap-1"
        >
          ← Back to Projects
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-display text-gold mb-1">{project.title}</h1>
          <p className="text-ink-muted text-sm">
            {feedbackList.length} submission{feedbackList.length !== 1 ? "s" : ""}
          </p>
          {project.downloadUrl && (
            <div className="mt-4 flex flex-col gap-1.5 items-start">
              <SmashDownloadButton
                href={project.downloadUrl}
                expiresAt={project.downloadExpiresAt}
                showExpiredHint
              />
              <p className="text-ink-faint text-xs">
                {formatDownloadExpiryNotice(project.downloadExpiresAt)}
              </p>
            </div>
          )}
        </div>

        {feedbackList.length === 0 ? (
          <div className="text-center py-20 text-ink-muted">
            <p className="font-display text-lg">No feedback yet.</p>
            <p className="text-sm mt-1">Share the client link to collect responses.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {feedbackList.map((fb) => (
              <div key={fb._id} className="bg-bg-card rounded-xl shadow-neu-flat p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-ink text-lg">{fb.clientName}</p>
                    <p className="text-ink-muted text-xs mt-0.5">
                      {new Date(fb._creationTime).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {STARS.map((s) => (
                      <span
                        key={s}
                        className={`text-xl ${s <= fb.rating ? "text-gold" : "text-ink-faint"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {fb.timestampedNotes && fb.timestampedNotes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-widest text-ink-muted mb-2">
                      Timestamped Notes
                    </p>
                    <div className="flex flex-col gap-2">
                      {fb.timestampedNotes.map((note, i) => (
                        <div
                          key={i}
                          className="flex gap-3 bg-bg-elevated rounded-lg px-4 py-2.5 shadow-neu-inset"
                        >
                          <span className="text-gold font-mono text-sm font-semibold shrink-0">
                            {note.timestamp}
                          </span>
                          <span className="text-ink text-sm">{note.comment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fb.generalNotes && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ink-muted mb-2">
                      General Notes
                    </p>
                    <p className="text-ink text-sm leading-relaxed bg-bg-elevated rounded-lg px-4 py-3 shadow-neu-inset">
                      {fb.generalNotes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
