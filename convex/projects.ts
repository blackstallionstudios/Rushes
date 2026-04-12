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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      title: args.title,
      videoUrl: args.videoUrl,
      message: args.message,
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
