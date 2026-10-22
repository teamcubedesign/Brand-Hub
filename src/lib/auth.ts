import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth-cookie";
import { getProfile } from "@/lib/data";
import type { Profile } from "@/lib/types";

export { SESSION_COOKIE };

/*
 * MOCK AUTH — the signed-in user is just a profile id in a cookie.
 * The dev team replaces getCurrentUser() (and the actions in
 * src/app/auth-actions.ts) with real Google sign-in. Everything else reads
 * the user through getCurrentUser(), so nothing else changes.
 */

// One lookup per request, shared by the layout, page and actions.
export const getCurrentUser = cache(async (): Promise<Profile> => {
  const userId = (await cookies()).get(SESSION_COOKIE)?.value;
  const profile = userId ? await getProfile(userId) : null;
  // A cookie for a user that no longer exists: clear it rather than loop.
  if (!profile) redirect(userId ? "/logout" : "/login");
  return profile;
});

export function canEdit(user: Profile) {
  return user.role === "admin" || user.role === "editor";
}
