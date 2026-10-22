"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth";
import { getProfile, listProfiles } from "@/lib/data";
import { safeNextPath } from "@/lib/safe-next";

// MOCK: stands in for "Continue with Google". Signs in as the first admin.
export async function signIn(formData: FormData) {
  const admin = (await listProfiles()).find((p) => p.role === "admin");
  if (!admin) throw new Error("The mock data has no admin.");
  await setSession(admin.id);
  redirect(safeNextPath(formData.get("next")?.toString()));
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

// MOCK ONLY: lets you preview the app as each team member and role.
export async function switchUser(userId: string) {
  if (await getProfile(userId)) await setSession(userId);
}

async function setSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
