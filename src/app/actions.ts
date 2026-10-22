"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEdit, getCurrentUser } from "@/lib/auth";
import { normalizeHex } from "@/lib/colors";
import * as data from "@/lib/data";
import { LINK_CATEGORIES, normalizeUrl } from "@/lib/links";
import type { ActionResult, ClientInput, ClientStatus, SocialKey, UserRole } from "@/lib/types";

const SOCIAL_KEYS: SocialKey[] = ["instagram", "linkedin", "facebook", "x", "youtube", "behance"];
const STATUSES: ClientStatus[] = ["active", "paused", "archived"];
const ROLES: UserRole[] = ["admin", "editor", "viewer"];

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function list(formData: FormData, key: string) {
  return [
    ...new Set(
      (text(formData, key) ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

async function requireEditor() {
  const user = await getCurrentUser();
  if (!canEdit(user)) throw new Error("You don't have permission to edit.");
  return user;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

function clientFields(formData: FormData): ClientInput {
  const socials: Partial<Record<SocialKey, string>> = {};
  for (const key of SOCIAL_KEYS) {
    const url = normalizeUrl(text(formData, `social_${key}`));
    if (url) socials[key] = url;
  }
  const status = text(formData, "status") as ClientStatus | null;

  return {
    name: text(formData, "name") ?? "",
    logo_url: normalizeUrl(text(formData, "logo_url")),
    tagline: text(formData, "tagline"),
    industry: text(formData, "industry"),
    website: normalizeUrl(text(formData, "website")),
    description: text(formData, "description"),
    tone_of_voice: text(formData, "tone_of_voice"),
    brand_color: normalizeHex(text(formData, "brand_color")),
    status: status && STATUSES.includes(status) ? status : "active",
    start_date: text(formData, "start_date"),
    services: list(formData, "services"),
    tags: list(formData, "tags"),
    socials,
    dos: text(formData, "dos"),
    donts: text(formData, "donts"),
  };
}

function validateClient(fields: ClientInput, formData: FormData): ActionResult {
  if (!fields.name) return { error: "Client name is required." };
  // normalizeHex turns bad input into null, so compare against what was typed.
  if (text(formData, "brand_color") && !fields.brand_color) {
    return { error: "Brand colour must be a HEX value like #4F46E5." };
  }
}

export async function createClientProfile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireEditor();
  const fields = clientFields(formData);
  const invalid = validateClient(fields, formData);
  if (invalid) return invalid;

  const id = await data.createClient(fields, user.id);
  revalidatePath("/");
  redirect(`/clients/${id}?created=1`);
}

export async function updateClientProfile(
  clientId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditor();
  const fields = clientFields(formData);
  const invalid = validateClient(fields, formData);
  if (invalid) return invalid;

  await data.updateClient(clientId, fields);
  revalidatePath("/");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}?saved=1`);
}

export async function setClientStatus(clientId: string, status: ClientStatus) {
  await requireEditor();
  if (!STATUSES.includes(status)) return;
  await data.updateClient(clientId, { status });
  revalidatePath("/");
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClientProfile(clientId: string) {
  const user = await getCurrentUser();
  if (user.role !== "admin") throw new Error("Only admins can delete clients.");
  await data.deleteClient(clientId);
  revalidatePath("/");
  redirect("/?deleted=1");
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

export async function saveLink(clientId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireEditor();
  const url = normalizeUrl(text(formData, "url"));
  if (!url) return { error: "Paste a link first." };
  try {
    new URL(url);
  } catch {
    return { error: "That doesn't look like a valid link." };
  }

  const category = text(formData, "category") ?? "other";
  await data.saveLink(
    clientId,
    text(formData, "id"),
    {
      url,
      title: text(formData, "title") ?? fallbackTitle(url),
      category: LINK_CATEGORIES.some((c) => c.value === category) ? category : "other",
      note: text(formData, "note"),
    },
    user.id,
  );
  revalidatePath(`/clients/${clientId}`);
}

function fallbackTitle(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    const last = decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "");
    return last && !/^[\w-]{20,}$/.test(last) ? last : hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function toggleLinkPin(clientId: string, linkId: string, pinned: boolean) {
  await requireEditor();
  await data.setLinkPinned(clientId, linkId, pinned);
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteLink(clientId: string, linkId: string) {
  await requireEditor();
  await data.deleteLink(clientId, linkId);
  revalidatePath(`/clients/${clientId}`);
}

// ---------------------------------------------------------------------------
// Brand colours and fonts
// ---------------------------------------------------------------------------

export async function saveColor(clientId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireEditor();
  const hex = normalizeHex(text(formData, "hex"));
  if (!hex) return { error: "Enter a HEX value like #1A2B3C." };

  await data.saveColor(clientId, text(formData, "id"), {
    hex,
    name: text(formData, "name"),
    usage: text(formData, "usage"),
  });
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteColor(clientId: string, colorId: string) {
  await requireEditor();
  await data.deleteColor(clientId, colorId);
  revalidatePath(`/clients/${clientId}`);
}

export async function saveFont(clientId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireEditor();
  const name = text(formData, "name");
  if (!name) return { error: "Font name is required." };

  await data.saveFont(clientId, text(formData, "id"), {
    name,
    weights: text(formData, "weights"),
    usage: text(formData, "usage"),
    file_url: normalizeUrl(text(formData, "file_url")),
  });
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteFont(clientId: string, fontId: string) {
  await requireEditor();
  await data.deleteFont(clientId, fontId);
  revalidatePath(`/clients/${clientId}`);
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function addNote(clientId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireEditor();
  const body = text(formData, "body");
  if (!body) return { error: "Write something first." };

  await data.addNote(clientId, body, user.id);
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteNote(clientId: string, noteId: string) {
  await requireEditor();
  await data.deleteNote(clientId, noteId);
  revalidatePath(`/clients/${clientId}`);
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export async function setUserRole(userId: string, role: UserRole) {
  const user = await getCurrentUser();
  if (user.role !== "admin") throw new Error("Only admins can change roles.");
  // Admins can't change their own role, so the team can't be left without one.
  if (userId === user.id || !ROLES.includes(role)) return;

  await data.setProfileRole(userId, role);
  revalidatePath("/team");
}
