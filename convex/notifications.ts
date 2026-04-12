"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendNtfy = internalAction({
  args: {
    projectTitle: v.string(),
    clientName: v.string(),
    rating: v.number(),
    noteCount: v.number(),
  },
  handler: async (_ctx, args) => {
    const topic = process.env.NTFY_TOPIC;
    if (!topic) {
      console.warn("NTFY_TOPIC not set — skipping notification.");
      return null;
    }

    const stars = "*".repeat(args.rating) + "-".repeat(5 - args.rating);
    const body = `${args.clientName} left feedback on "${args.projectTitle}"\n${stars}\n${args.noteCount} timestamped note${args.noteCount !== 1 ? "s" : ""}`;

    try {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Title: `New Rushes Feedback`,
          Priority: "default",
          Tags: "clapper",
        },
        body,
      });
    } catch (err) {
      console.error("ntfy notification failed:", err);
    }

    return null;
  },
});
