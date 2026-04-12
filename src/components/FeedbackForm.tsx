import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TimestampedNote {
  timestamp: string;
  comment: string;
}

interface Props {
  projectId: Id<"projects">;
  projectTitle: string;
  onSubmitted: () => void;
}

const STARS = [1, 2, 3, 4, 5];

export default function FeedbackForm({ projectId, projectTitle, onSubmitted }: Props) {
  const submitFeedback = useMutation(api.feedback.submitFeedback);

  const [clientName, setClientName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState<TimestampedNote[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addNote() {
    setNotes([...notes, { timestamp: "", comment: "" }]);
  }

  function updateNote(index: number, field: keyof TimestampedNote, value: string) {
    const updated = [...notes];
    updated[index] = { ...updated[index], [field]: value };
    setNotes(updated);
  }

  function removeNote(index: number) {
    setNotes(notes.filter((_, i) => i !== index));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!clientName.trim()) errs.clientName = "Please enter your name.";
    if (!rating) errs.rating = "Please select a rating.";
    for (let i = 0; i < notes.length; i++) {
      if (!notes[i].timestamp.trim()) errs[`note_ts_${i}`] = "Timestamp required.";
      if (!notes[i].comment.trim()) errs[`note_cm_${i}`] = "Comment required.";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await submitFeedback({
        projectId,
        projectTitle,
        clientName: clientName.trim(),
        rating,
        timestampedNotes: notes,
        generalNotes: generalNotes.trim() || undefined,
      });
      onSubmitted();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-bg-card rounded-xl shadow-neu-flat p-6">
        <h2 className="text-xl font-display text-ink mb-5">Your Feedback</h2>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-xs uppercase tracking-widest text-ink-muted mb-1.5">
            Your Name
          </label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-3 text-ink focus:border-gold transition-colors shadow-neu-inset"
          />
          {errors.clientName && (
            <p className="text-red-400 text-xs mt-1">{errors.clientName}</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted mb-2">
            Overall Rating
          </label>
          <div className="flex gap-2">
            {STARS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="star-btn text-3xl leading-none p-1 rounded-lg focus:outline-none"
                aria-label={`${s} star${s !== 1 ? "s" : ""}`}
              >
                <span
                  className={
                    s <= (hoverRating || rating)
                      ? "text-gold"
                      : "text-ink-faint"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-400 text-xs mt-1">{errors.rating}</p>
          )}
        </div>
      </div>

      {/* Timestamped Notes */}
      <div className="bg-bg-card rounded-xl shadow-neu-flat p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-display text-ink">Timestamped Notes</h2>
            <p className="text-ink-muted text-xs mt-0.5">
              Reference specific moments in the video
            </p>
          </div>
          <button
            type="button"
            onClick={addNote}
            className="px-4 py-2 rounded-lg border border-gold text-gold text-sm hover:bg-gold-muted transition-colors"
          >
            + Add Note
          </button>
        </div>

        {notes.length === 0 && (
          <p className="text-ink-faint text-sm text-center py-4">
            No notes yet — click "Add Note" to reference a moment.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {notes.map((note, i) => (
            <div
              key={i}
              className="bg-bg-elevated rounded-lg p-4 shadow-neu-inset flex flex-col gap-2"
            >
              <div className="flex gap-3 items-start">
                <div className="w-24 shrink-0">
                  <label className="block text-xs text-ink-muted mb-1">Time</label>
                  <input
                    value={note.timestamp}
                    onChange={(e) => updateNote(i, "timestamp", e.target.value)}
                    placeholder="0:32"
                    className="w-full bg-bg border border-ink-faint rounded px-3 py-2 text-gold font-mono text-sm focus:border-gold transition-colors"
                  />
                  {errors[`note_ts_${i}`] && (
                    <p className="text-red-400 text-xs mt-0.5">{errors[`note_ts_${i}`]}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-ink-muted mb-1">Comment</label>
                  <input
                    value={note.comment}
                    onChange={(e) => updateNote(i, "comment", e.target.value)}
                    placeholder="The cut here feels too abrupt…"
                    className="w-full bg-bg border border-ink-faint rounded px-3 py-2 text-ink text-sm focus:border-gold transition-colors"
                  />
                  {errors[`note_cm_${i}`] && (
                    <p className="text-red-400 text-xs mt-0.5">{errors[`note_cm_${i}`]}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeNote(i)}
                  className="mt-5 text-ink-faint hover:text-red-400 transition-colors text-lg leading-none"
                  aria-label="Remove note"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Notes */}
      <div className="bg-bg-card rounded-xl shadow-neu-flat p-6">
        <h2 className="text-xl font-display text-ink mb-1">General Notes</h2>
        <p className="text-ink-muted text-xs mb-4">Any overall thoughts or context</p>
        <textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Overall I love the pacing, but the colour grade in the opening feels a touch cool…"
          rows={4}
          className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-3 text-ink focus:border-gold transition-colors shadow-neu-inset resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl bg-gold text-bg font-semibold text-base tracking-wide hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-gold-glow"
      >
        {submitting ? "Submitting…" : "Submit Feedback"}
      </button>
    </form>
  );
}
