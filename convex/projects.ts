import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").order("desc").collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const createProject = mutation({
  args: {
    title: v.string(),
    videoUrl: v.string(),
    message: v.optional(v.string()),
    downloadUrl: v.optional(v.string()),
    downloadExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const downloadExpiresAt =
      args.downloadExpiresAt ?? Date.now() + sevenDays;
    return await ctx.db.insert("projects", {
      title: args.title,
      videoUrl: args.videoUrl,
      message: args.message,
      downloadUrl: args.downloadUrl,
      downloadExpiresAt,
    });
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    videoUrl: v.string(),
    message: v.optional(v.string()),
    downloadUrl: v.optional(v.string()),
    downloadExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.projectId);
    if (!existing) {
      throw new Error("Project not found");
    }
    const message = args.message?.trim() ? args.message.trim() : undefined;
    const downloadUrl = args.downloadUrl?.trim() ? args.downloadUrl.trim() : undefined;
    await ctx.db.patch(args.projectId, {
      title: args.title.trim(),
      videoUrl: args.videoUrl.trim(),
      message,
      downloadUrl,
      downloadExpiresAt: args.downloadExpiresAt,
    });
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Delete all feedback for this project first
    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const fb of feedback) {
      await ctx.db.delete(fb._id);
    }
    await ctx.db.delete(args.projectId);
  },
});
