import "server-only";
import type {
  BrandColor,
  BrandFont,
  Client,
  ClientInput,
  ClientSummary,
  Link,
  NoteWithAuthor,
  Profile,
  UserRole,
} from "@/lib/types";
import { mutate, newId, readDb, type Db } from "./store";

/*
 * DATA ACCESS LAYER — every read and write the app makes goes through here.
 *
 * Right now these functions use the local mock store. To connect a real
 * database, re-implement each function with the same signature; no page or
 * component needs to change. Permission checks live in `src/app/actions.ts`
 * and should also be enforced by the database (see supabase/migrations).
 */

const now = () => new Date().toISOString();

function touchClient(db: Db, clientId: string) {
  const client = db.clients.find((c) => c.id === clientId);
  if (client) client.updated_at = now();
}

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export async function listProfiles(): Promise<Profile[]> {
  const db = await readDb();
  return db.profiles.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function getProfile(id: string): Promise<Profile | null> {
  const db = await readDb();
  return db.profiles.find((p) => p.id === id) ?? null;
}

export async function setProfileRole(id: string, role: UserRole) {
  await mutate((db) => {
    const profile = db.profiles.find((p) => p.id === id);
    if (profile) profile.role = role;
  });
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export async function listClients(): Promise<ClientSummary[]> {
  const db = await readDb();
  return db.clients
    .map((c) => ({
      ...c,
      linkCount: db.links.filter((l) => l.client_id === c.id).length,
      palette: db.brand_colors
        .filter((col) => col.client_id === c.id)
        .sort(byPosition)
        .map((col) => col.hex),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getClient(id: string): Promise<Client | null> {
  const db = await readDb();
  return db.clients.find((c) => c.id === id) ?? null;
}

export async function getClientDetails(clientId: string) {
  const db = await readDb();
  const ofClient = <T extends { client_id: string }>(rows: T[]) => rows.filter((r) => r.client_id === clientId);

  const notes: NoteWithAuthor[] = ofClient(db.notes)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((note) => {
      const author = db.profiles.find((p) => p.id === note.created_by);
      return { ...note, author: author ? { full_name: author.full_name, email: author.email } : null };
    });

  return {
    colors: ofClient(db.brand_colors).sort(byPosition),
    fonts: ofClient(db.brand_fonts).sort(byPosition),
    links: ofClient(db.links).sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at)),
    notes,
  };
}

export async function createClient(input: ClientInput, userId: string): Promise<string> {
  return mutate((db) => {
    const client: Client = { ...input, id: newId(), created_by: userId, created_at: now(), updated_at: now() };
    db.clients.push(client);
    return client.id;
  });
}

export async function updateClient(id: string, input: Partial<ClientInput>) {
  await mutate((db) => {
    const client = db.clients.find((c) => c.id === id);
    if (client) Object.assign(client, input, { updated_at: now() });
  });
}

export async function deleteClient(id: string) {
  await mutate((db) => {
    db.clients = db.clients.filter((c) => c.id !== id);
    db.brand_colors = db.brand_colors.filter((r) => r.client_id !== id);
    db.brand_fonts = db.brand_fonts.filter((r) => r.client_id !== id);
    db.links = db.links.filter((r) => r.client_id !== id);
    db.notes = db.notes.filter((r) => r.client_id !== id);
  });
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

type LinkInput = Pick<Link, "url" | "title" | "category" | "note">;

export async function saveLink(clientId: string, linkId: string | null, input: LinkInput, userId: string) {
  await mutate((db) => {
    const existing = linkId && db.links.find((l) => l.id === linkId && l.client_id === clientId);
    if (existing) Object.assign(existing, input);
    else
      db.links.push({
        ...input,
        id: newId(),
        client_id: clientId,
        pinned: false,
        position: 0,
        created_by: userId,
        created_at: now(),
      });
    touchClient(db, clientId);
  });
}

export async function setLinkPinned(clientId: string, linkId: string, pinned: boolean) {
  await mutate((db) => {
    const link = db.links.find((l) => l.id === linkId && l.client_id === clientId);
    if (link) link.pinned = pinned;
    touchClient(db, clientId);
  });
}

export async function deleteLink(clientId: string, linkId: string) {
  await mutate((db) => {
    db.links = db.links.filter((l) => !(l.id === linkId && l.client_id === clientId));
    touchClient(db, clientId);
  });
}

// ---------------------------------------------------------------------------
// Brand colours and fonts
// ---------------------------------------------------------------------------

type ColorInput = Pick<BrandColor, "hex" | "name" | "usage">;
type FontInput = Pick<BrandFont, "name" | "weights" | "usage" | "file_url">;

function nextPosition(rows: { client_id: string; position: number }[], clientId: string) {
  return Math.max(-1, ...rows.filter((r) => r.client_id === clientId).map((r) => r.position)) + 1;
}

export async function saveColor(clientId: string, colorId: string | null, input: ColorInput) {
  await mutate((db) => {
    const existing = colorId && db.brand_colors.find((c) => c.id === colorId && c.client_id === clientId);
    if (existing) Object.assign(existing, input);
    else db.brand_colors.push({ ...input, id: newId(), client_id: clientId, position: nextPosition(db.brand_colors, clientId) });
    touchClient(db, clientId);
  });
}

export async function deleteColor(clientId: string, colorId: string) {
  await mutate((db) => {
    db.brand_colors = db.brand_colors.filter((c) => !(c.id === colorId && c.client_id === clientId));
    touchClient(db, clientId);
  });
}

export async function saveFont(clientId: string, fontId: string | null, input: FontInput) {
  await mutate((db) => {
    const existing = fontId && db.brand_fonts.find((f) => f.id === fontId && f.client_id === clientId);
    if (existing) Object.assign(existing, input);
    else db.brand_fonts.push({ ...input, id: newId(), client_id: clientId, position: nextPosition(db.brand_fonts, clientId) });
    touchClient(db, clientId);
  });
}

export async function deleteFont(clientId: string, fontId: string) {
  await mutate((db) => {
    db.brand_fonts = db.brand_fonts.filter((f) => !(f.id === fontId && f.client_id === clientId));
    touchClient(db, clientId);
  });
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function addNote(clientId: string, body: string, userId: string) {
  await mutate((db) => {
    db.notes.push({ id: newId(), client_id: clientId, body, created_by: userId, created_at: now() });
    touchClient(db, clientId);
  });
}

export async function deleteNote(clientId: string, noteId: string) {
  await mutate((db) => {
    db.notes = db.notes.filter((n) => !(n.id === noteId && n.client_id === clientId));
    touchClient(db, clientId);
  });
}
