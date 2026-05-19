import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import ProjectFeedbackView from "./ProjectFeedbackView";
import SmashDownloadButton from "./SmashDownloadButton";
import {
  SEVEN_DAYS_MS,
  dateInputValueToEndOfDayMs,
  formatDownloadExpiryNotice,
  msToDateInputValue,
  suggestedDefaultExpiryDateInputValue,
} from "../lib/downloadExpiry";

function ProjectFormFields({
  title,
  setTitle,
  videoUrl,
  setVideoUrl,
  downloadUrl,
  setDownloadUrl,
  downloadExpiresDate,
  setDownloadExpiresDate,
  message,
  setMessage,
}: {
  title: string;
  setTitle: (v: string) => void;
  videoUrl: string;
  setVideoUrl: (v: string) => void;
  downloadUrl: string;
  setDownloadUrl: (v: string) => void;
  downloadExpiresDate: string;
  setDownloadExpiresDate: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted mb-1.5">
          Project Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Brand Film — Cut 3"
          className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-2.5 text-ink focus:border-gold transition-colors shadow-neu-inset"
          required
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted mb-1.5">
          Video URL (YouTube or Vimeo)
        </label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://vimeo.com/123456789"
          className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-2.5 text-ink focus:border-gold transition-colors shadow-neu-inset"
          required
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted mb-1.5">
          Smash download link <span className="normal-case text-ink-faint">(optional)</span>
        </label>
        <input
          value={downloadUrl}
          onChange={(e) => setDownloadUrl(e.target.value)}
          placeholder="https://fromsmash.com/…"
          type="url"
          className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-2.5 text-ink focus:border-gold transition-colors shadow-neu-inset"
        />
        <p className="text-ink-faint text-xs mt-1.5">
          Shown on the dashboard and client page as a download button.
        </p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted mb-1.5">
          Download link expires
        </label>
        <input
          type="date"
          value={downloadExpiresDate}
          onChange={(e) => setDownloadExpiresDate(e.target.value)}
          className="w-full max-w-xs bg-bg-elevated border border-ink-faint rounded-lg px-4 py-2.5 text-ink focus:border-gold transition-colors shadow-neu-inset [color-scheme:dark]"
        />
        <p className="text-ink-faint text-xs mt-1.5">
          Defaults to one week from creation; clients lose the download button after this date.
        </p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted mb-1.5">
          Message to Client <span className="normal-case text-ink-faint">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A brief note for your client…"
          rows={3}
          className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-2.5 text-ink focus:border-gold transition-colors shadow-neu-inset resize-none"
        />
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const projects = useQuery(api.projects.listProjects) ?? [];
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);
  const rotateShareToken = useMutation(api.projects.rotateShareToken);
  const { signOut } = useAuthActions();

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadExpiresDate, setDownloadExpiresDate] = useState(() =>
    suggestedDefaultExpiryDateInputValue()
  );
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<Id<"projects"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editDownloadUrl, setEditDownloadUrl] = useState("");
  const [editDownloadExpiresDate, setEditDownloadExpiresDate] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Id<"projects"> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function openCreateForm() {
    setShowForm(true);
    setDownloadExpiresDate(suggestedDefaultExpiryDateInputValue());
    cancelEdit();
  }

  function closeCreateForm() {
    setShowForm(false);
  }

  function toggleCreateForm() {
    if (showForm) {
      closeCreateForm();
    } else {
      openCreateForm();
    }
  }

  function beginEdit(p: Doc<"projects">) {
    setEditingId(p._id);
    setEditTitle(p.title);
    setEditVideoUrl(p.videoUrl);
    setEditDownloadUrl(p.downloadUrl ?? "");
    setEditDownloadExpiresDate(
      msToDateInputValue(
        p.downloadExpiresAt ?? p._creationTime + SEVEN_DAYS_MS
      )
    );
    setEditMessage(p.message ?? "");
    setShowForm(false);
    setConfirmDelete(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !videoUrl) return;
    setCreating(true);
    try {
      await createProject({
        title,
        videoUrl,
        message: message.trim() || undefined,
        downloadUrl: downloadUrl.trim() || undefined,
        downloadExpiresAt: dateInputValueToEndOfDayMs(downloadExpiresDate),
      });
      setTitle("");
      setVideoUrl("");
      setDownloadUrl("");
      setDownloadExpiresDate(suggestedDefaultExpiryDateInputValue());
      setMessage("");
      closeCreateForm();
    } finally {
      setCreating(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editTitle || !editVideoUrl) return;
    setSavingEdit(true);
    try {
      await updateProject({
        projectId: editingId,
        title: editTitle,
        videoUrl: editVideoUrl,
        message: editMessage.trim() || undefined,
        downloadUrl: editDownloadUrl.trim() || undefined,
        downloadExpiresAt: dateInputValueToEndOfDayMs(editDownloadExpiresDate),
      });
      cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  }

  function copyLink(p: Doc<"projects">) {
    if (!p.shareToken) return;
    const url = `${window.location.origin}/share/${p.shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(p._id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleRotate(id: Id<"projects">) {
    if (
      !window.confirm(
        "Rotate share link? The old link will stop working immediately."
      )
    ) {
      return;
    }
    await rotateShareToken({ projectId: id });
  }

  async function handleDelete(id: Id<"projects">) {
    await deleteProject({ projectId: id });
    setConfirmDelete(null);
    if (editingId === id) cancelEdit();
  }

  if (selectedProject) {
    return (
      <ProjectFeedbackView
        projectId={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-display text-gold">Rushes</h1>
            <p className="text-ink-muted text-sm mt-1">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCreateForm}
              className="px-5 py-2.5 rounded-lg bg-gold text-bg font-semibold text-sm hover:bg-gold-light transition-colors shadow-gold-glow"
            >
              {showForm ? "Cancel" : "+ New Project"}
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="px-4 py-2.5 rounded-lg border border-ink-faint text-ink-muted text-sm hover:border-gold/50 hover:text-gold transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-bg-card rounded-xl shadow-neu-flat p-6 mb-8 flex flex-col gap-4"
          >
            <h2 className="text-xl font-display text-ink mb-1">New Project</h2>

            <ProjectFormFields
              title={title}
              setTitle={setTitle}
              videoUrl={videoUrl}
              setVideoUrl={setVideoUrl}
              downloadUrl={downloadUrl}
              setDownloadUrl={setDownloadUrl}
              downloadExpiresDate={downloadExpiresDate}
              setDownloadExpiresDate={setDownloadExpiresDate}
              message={message}
              setMessage={setMessage}
            />

            <button
              type="submit"
              disabled={creating || !title || !videoUrl}
              className="self-end px-6 py-2.5 rounded-lg bg-gold text-bg font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? "Creating…" : "Create Project"}
            </button>
          </form>
        )}

        {/* Projects list */}
        {projects.length === 0 ? (
          <div className="text-center py-20 text-ink-muted">
            <p className="text-lg font-display">No projects yet.</p>
            <p className="text-sm mt-1">Create your first project above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {projects.map((p) => (
              <div
                key={p._id}
                className="bg-bg-card rounded-xl shadow-neu-flat p-5 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg text-ink truncate">{p.title}</h3>
                    <p className="text-ink-muted text-xs mt-0.5">
                      {new Date(p._creationTime).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {p.downloadUrl && editingId !== p._id && (
                      <div className="mt-3 flex flex-col gap-1.5 items-start">
                        <SmashDownloadButton
                          href={p.downloadUrl}
                          expiresAt={p.downloadExpiresAt}
                          showExpiredHint
                        />
                        <p className="text-ink-faint text-xs">
                          {formatDownloadExpiryNotice(p.downloadExpiresAt)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => copyLink(p)}
                      disabled={!p.shareToken}
                      title={
                        p.shareToken
                          ? undefined
                          : "Run the share-token backfill migration to enable this link."
                      }
                      className="px-4 py-2 rounded-lg border border-gold text-gold text-sm hover:bg-gold-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {copied === p._id ? "Copied!" : "Copy Link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRotate(p._id)}
                      disabled={!p.shareToken}
                      className="px-4 py-2 rounded-lg border border-ink-faint text-ink-muted text-sm hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Rotate Link
                    </button>
                    <button
                      type="button"
                      onClick={() => (editingId === p._id ? cancelEdit() : beginEdit(p))}
                      disabled={editingId === p._id && savingEdit}
                      className="px-4 py-2 rounded-lg border border-ink-faint text-ink text-sm hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {editingId === p._id ? "Close" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProject(p._id)}
                      className="px-4 py-2 rounded-lg bg-bg-elevated text-ink text-sm hover:bg-ink-faint transition-colors shadow-neu-flat"
                    >
                      View Feedback
                    </button>
                    {confirmDelete === p._id ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id)}
                          className="px-4 py-2 rounded-lg bg-red-900 text-red-300 text-sm hover:bg-red-800 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-2 rounded-lg bg-bg-elevated text-ink-muted text-sm hover:bg-ink-faint transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(p._id)}
                        className="px-4 py-2 rounded-lg border border-red-900/50 text-red-400 text-sm hover:bg-red-900/20 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {editingId === p._id && (
                  <form
                    onSubmit={handleEditSubmit}
                    className="pt-4 border-t border-ink-faint/40 flex flex-col gap-4"
                  >
                    <h4 className="text-sm font-display text-gold tracking-wide">Edit project</h4>
                    <ProjectFormFields
                      title={editTitle}
                      setTitle={setEditTitle}
                      videoUrl={editVideoUrl}
                      setVideoUrl={setEditVideoUrl}
                      downloadUrl={editDownloadUrl}
                      setDownloadUrl={setEditDownloadUrl}
                      downloadExpiresDate={editDownloadExpiresDate}
                      setDownloadExpiresDate={setEditDownloadExpiresDate}
                      message={editMessage}
                      setMessage={setEditMessage}
                    />
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        className="px-5 py-2.5 rounded-lg bg-bg-elevated text-ink-muted text-sm hover:bg-ink-faint transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingEdit || !editTitle || !editVideoUrl}
                        className="px-6 py-2.5 rounded-lg bg-gold text-bg font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-gold-glow"
                      >
                        {savingEdit ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
