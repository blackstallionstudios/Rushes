import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const verifyPin = mutation({
  args: { pin: v.string() },
  handler: async (_ctx, args) => {
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      throw new Error("ADMIN_PIN environment variable is not set.");
    }
    return args.pin === adminPin;
  },
});
