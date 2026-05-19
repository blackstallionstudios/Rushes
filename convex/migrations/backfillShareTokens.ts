import { internalMutation } from "../_generated/server";
import { generateShareToken } from "../lib/admin";

/**
 * One-time backfill: assign a share token to every project that lacks one.
 * Run with: npx convex run migrations/backfillShareTokens:run
 * Delete this file (and the corresponding generated entry) after running.
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("projects").collect();
    let backfilled = 0;
    for (const p of all) {
      if (!p.shareToken) {
        await ctx.db.patch(p._id, { shareToken: generateShareToken() });
        backfilled++;
      }
    }
    return { total: all.length, backfilled };
  },
});
