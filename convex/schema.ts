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
  }),

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
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
