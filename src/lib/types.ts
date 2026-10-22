export type UserRole = "admin" | "editor" | "viewer";
export type ClientStatus = "active" | "paused" | "archived";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
};

export type Socials = Partial<Record<SocialKey, string>>;
export type SocialKey =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "x"
  | "youtube"
  | "behance";

export type Client = {
  id: string;
  name: string;
  logo_url: string | null;
  tagline: string | null;
  industry: string | null;
  website: string | null;
  description: string | null;
  tone_of_voice: string | null;
  brand_color: string | null;
  status: ClientStatus;
  start_date: string | null;
  services: string[];
  tags: string[];
  socials: Socials;
  dos: string | null;
  donts: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/** Editable client fields, as submitted by the client form. */
export type ClientInput = Omit<Client, "id" | "created_by" | "created_at" | "updated_at">;

/** A client plus the bits the dashboard card shows. */
export type ClientSummary = Client & { linkCount: number; palette: string[] };

export type BrandColor = {
  id: string;
  client_id: string;
  name: string | null;
  hex: string;
  usage: string | null;
  position: number;
};

export type BrandFont = {
  id: string;
  client_id: string;
  name: string;
  weights: string | null;
  usage: string | null;
  file_url: string | null;
  position: number;
};

export type Link = {
  id: string;
  client_id: string;
  title: string;
  url: string;
  category: string;
  note: string | null;
  pinned: boolean;
  position: number;
  created_by: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  client_id: string;
  body: string;
  created_at: string;
  created_by: string | null;
};

export type NoteWithAuthor = Note & {
  author: { full_name: string | null; email: string } | null;
};

export type ActionResult = { error?: string } | undefined;
