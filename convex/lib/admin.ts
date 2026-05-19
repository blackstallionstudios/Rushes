import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Verify the caller is the single configured admin.
 * Throws "Unauthorized" if not signed in, or if the signed-in user's email
 * does not match ADMIN_EMAIL. Single-admin model — swap for a roles table
 * if you ever need more than one.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is not configured on the Convex deployment.");
  }
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await ctx.db.get(userId);
  if (!user || (user as { email?: string }).email !== adminEmail) {
    throw new Error("Unauthorized");
  }
}

/** Generate a 24-byte (192-bit) base64url share token. No structural tells. */
export function generateShareToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
