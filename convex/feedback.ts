import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireAdmin } from "./lib/admin";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

export const listFeedback = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("feedback")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const submitFeedback = mutation({
  args: {
    shareToken: v.string(),
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
    const project = await ctx.db
      .query("projects")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .unique();
    if (!project) {
      throw new Error("Invalid or revoked link.");
    }

    // Sliding-window rate limit per share token.
    const now = Date.now();
    const existingLimit = await ctx.db
      .query("feedbackRateLimits")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .unique();
    if (existingLimit) {
      if (now - existingLimit.windowStartedAt > RATE_LIMIT_WINDOW_MS) {
        await ctx.db.patch(existingLimit._id, { count: 1, windowStartedAt: now });
      } else if (existingLimit.count >= RATE_LIMIT_MAX) {
        throw new Error("Too many submissions. Please try again later.");
      } else {
        await ctx.db.patch(existingLimit._id, { count: existingLimit.count + 1 });
      }
    } else {
      await ctx.db.insert("feedbackRateLimits", {
        shareToken: args.shareToken,
        count: 1,
        windowStartedAt: now,
      });
    }

    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer 1–5.");
    }
    const clientName = args.clientName.trim();
    if (!clientName) throw new Error("Name is required.");
    if (clientName.length > 200) throw new Error("Name is too long.");

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
      projectId: project._id,
      clientName,
      rating: args.rating,
      timestampedNotes: args.timestampedNotes,
      generalNotes,
    });

    await ctx.scheduler.runAfter(0, internal.notifications.sendNtfy, {
      projectTitle: project.title,
      clientName,
      rating: args.rating,
      noteCount: args.timestampedNotes.length,
      feedbackSummary,
    });

    return id;
  },
});
