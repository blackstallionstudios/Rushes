import { useState } from "react";
import VideoEmbed from "./VideoEmbed";
import FeedbackForm from "./FeedbackForm";
import ConfirmationScreen from "./ConfirmationScreen";
import SmashDownloadButton from "./SmashDownloadButton";
import { formatDownloadExpiryNotice } from "../lib/downloadExpiry";

export interface SharedProject {
  shareToken: string;
  title: string;
  videoUrl: string;
  message?: string;
  downloadUrl?: string;
  downloadExpiresAt?: number;
}

interface Props {
  project: SharedProject;
}

export default function ClientView({ project }: Props) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Rushes</p>
          <h1 className="text-4xl font-display text-ink mb-3">{project.title}</h1>
          {project.message && (
            <p className="text-ink-muted text-sm leading-relaxed max-w-md mx-auto bg-bg-card rounded-xl px-5 py-4 shadow-neu-flat border border-ink-faint/30">
              {project.message}
            </p>
          )}
          {project.downloadUrl && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <SmashDownloadButton
                href={project.downloadUrl}
                expiresAt={project.downloadExpiresAt}
              />
              <p className="text-ink-muted text-sm text-center max-w-sm">
                {formatDownloadExpiryNotice(project.downloadExpiresAt)}
              </p>
            </div>
          )}
        </div>

        <div className="mb-8 rounded-xl overflow-hidden shadow-neu-flat">
          <VideoEmbed url={project.videoUrl} />
        </div>

        {submitted ? (
          <ConfirmationScreen />
        ) : (
          <FeedbackForm
            shareToken={project.shareToken}
            onSubmitted={() => setSubmitted(true)}
          />
        )}
      </div>
    </div>
  );
}
