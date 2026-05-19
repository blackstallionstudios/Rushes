import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query } from "./_generated/server";

/**
 * Single-admin auth. Sign-up is restricted to the email configured in
 * ADMIN_EMAIL on the Convex deployment — every other email is rejected at
 * the profile callback, so an attacker cannot create accounts to bypass
 * `requireAdmin` checks.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        if (!adminEmail) {
          throw new Error("ADMIN_EMAIL is not configured.");
        }
        if (email !== adminEmail) {
          throw new Error("Sign-up is disabled.");
        }
        return { email };
      },
    }),
  ],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return user;
  },
});

/** Lightweight client-side gate. Returns true only for the configured admin. */
export const currentUserIsAdmin = query({
  handler: async (ctx) => {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!adminEmail) return false;
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    const email = (user as { email?: string } | null)?.email?.trim().toLowerCase();
    return email === adminEmail;
  },
});
