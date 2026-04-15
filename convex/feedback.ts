import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const listFeedback = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const submitFeedback = mutation({
  args: {
    projectId: v.id("projects"),
    projectTitle: v.string(),
    clientName: v.string(),
    rating: v.number(),
    timestampedNotes: v.array(
      v.object({
        timestamp: v.string(),
        comment: v.string(),
      })
    ),
    generalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const firstTimestampedNote = args.timestampedNotes[0]?.comment?.trim();
    const generalNotes = args.generalNotes?.trim();
    const summarySource =
      generalNotes && generalNotes.length > 0
        ? generalNotes
        : firstTimestampedNote && firstTimestampedNote.length > 0
          ? firstTimestampedNote
          : `${args.timestampedNotes.length} timestamped note${args.timestampedNotes.length !== 1 ? "s" : ""}`;
    const feedbackSummary =
      summarySource.length > 140
        ? `${summarySource.slice(0, 137)}...`
        : summarySource;

    const id = await ctx.db.insert("feedback", {
      projectId: args.projectId,
      clientName: args.clientName,
      rating: args.rating,
      timestampedNotes: args.timestampedNotes,
      generalNotes: args.generalNotes,
    });

    // Fire ntfy notification
    await ctx.scheduler.runAfter(0, internal.notifications.sendNtfy, {
      projectTitle: args.projectTitle,
      clientName: args.clientName,
      rating: args.rating,
      noteCount: args.timestampedNotes.length,
      feedbackSummary,
    });

    return id;
  },
});
