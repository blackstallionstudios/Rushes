import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
    title: v.string(),
    videoUrl: v.string(),
    message: v.optional(v.string()),
    /** Smash (or other) file transfer link for full-resolution downloads */
    downloadUrl: v.optional(v.string()),
    /** Unix ms: download link is hidden after this instant (typically end of selected local day). */
    downloadExpiresAt: v.optional(v.number()),
    /**
     * Random opaque token used in client-facing URLs (/share/:shareToken).
     * Optional only to permit backfill; treat as required for any new project.
     */
    shareToken: v.optional(v.string()),
  }).index("by_share_token", ["shareToken"]),

  feedback: defineTable({
    projectId: v.id("projects"),
    clientName: v.string(),
    rating: v.number(),
    timestampedNotes: v.array(
      v.object({
        timestamp: v.string(),
        comment: v.string(),
      })
    ),
    generalNotes: v.optional(v.string()),
  }).index("by_project", ["projectId"]),

  /** Per-share-token sliding window throttle for public submitFeedback. */
  feedbackRateLimits: defineTable({
    shareToken: v.string(),
    count: v.number(),
    windowStartedAt: v.number(),
  }).index("by_share_token", ["shareToken"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
