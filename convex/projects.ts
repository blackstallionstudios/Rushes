import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, generateShareToken } from "./lib/admin";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// --- Admin-only ---

export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("projects").order("desc").collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    const downloadExpiresAt =
      args.downloadExpiresAt ?? Date.now() + SEVEN_DAYS_MS;
    return await ctx.db.insert("projects", {
      title: args.title,
      videoUrl: args.videoUrl,
      message: args.message,
      downloadUrl: args.downloadUrl,
      downloadExpiresAt,
      shareToken: generateShareToken(),
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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const fb of feedback) {
      await ctx.db.delete(fb._id);
    }
    // Drop any rate-limit row keyed on the dead project's share token.
    const project = await ctx.db.get(args.projectId);
    if (project?.shareToken) {
      const limits = await ctx.db
        .query("feedbackRateLimits")
        .withIndex("by_share_token", (q) => q.eq("shareToken", project.shareToken!))
        .collect();
      for (const row of limits) await ctx.db.delete(row._id);
    }
    await ctx.db.delete(args.projectId);
  },
});

export const rotateShareToken = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.projectId);
    if (!existing) throw new Error("Project not found");
    const shareToken = generateShareToken();
    await ctx.db.patch(args.projectId, { shareToken });
    return shareToken;
  },
});

// --- Public (client) ---

/**
 * Resolve a project from its share token. Returns only fields the client view
 * needs — no internal IDs, no feedback. Used by /share/:shareToken.
 */
export const getProjectByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .unique();
    if (!project) return null;
    return {
      shareToken: project.shareToken!,
      title: project.title,
      videoUrl: project.videoUrl,
      message: project.message,
      downloadUrl: project.downloadUrl,
      downloadExpiresAt: project.downloadExpiresAt,
    };
  },
});

/**
 * Old-route compatibility window: clients with /project/:projectId links
 * sent before the share-token migration can still resolve to the current
 * share token. Drop this query after the 30-day window expires.
 */
export const getShareTokenForLegacyProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || !project.shareToken) return null;
    return project.shareToken;
  },
});
