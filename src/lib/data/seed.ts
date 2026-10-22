import type { BrandColor, BrandFont, Client, Link, Note, Profile } from "@/lib/types";
import type { Db } from "./store";

// Sample data so every screen has something realistic to show.
// All URLs are placeholders.

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const profiles: Profile[] = [
  { id: "u-riya", email: "riya@cubehq.ai", full_name: "Riya Sharma", avatar_url: null, role: "admin", created_at: daysAgo(400) },
  { id: "u-kabir", email: "kabir@cubehq.ai", full_name: "Kabir Mehta", avatar_url: null, role: "editor", created_at: daysAgo(300) },
  { id: "u-ananya", email: "ananya@cubehq.ai", full_name: "Ananya Iyer", avatar_url: null, role: "editor", created_at: daysAgo(120) },
  { id: "u-dev", email: "dev@cubehq.ai", full_name: "Dev Patel", avatar_url: null, role: "viewer", created_at: daysAgo(3) },
];

function client(c: Partial<Client> & Pick<Client, "id" | "name">): Client {
  return {
    logo_url: null,
    tagline: null,
    industry: null,
    website: null,
    description: null,
    tone_of_voice: null,
    brand_color: null,
    status: "active",
    start_date: null,
    services: [],
    tags: [],
    socials: {},
    dos: null,
    donts: null,
    created_by: "u-riya",
    created_at: daysAgo(200),
    updated_at: daysAgo(10),
    ...c,
  };
}

const clients: Client[] = [
  client({
    id: "c-lumen",
    name: "Lumen Skincare",
    tagline: "Clean beauty for every day",
    industry: "Skincare",
    website: "https://lumen-skincare.example",
    description:
      "D2C skincare brand selling minimal, fragrance-free routines to women aged 22–35. Most sales come from Instagram and their own website.",
    tone_of_voice: "Calm, reassuring and science-backed. No hype words like “miracle” or “flawless”.",
    brand_color: "#E8A87C",
    start_date: "2025-03-01",
    services: ["Social", "Paid ads"],
    tags: ["D2C", "Retainer"],
    socials: { instagram: "https://instagram.com/lumen.example", linkedin: "https://linkedin.com/company/lumen-example" },
    dos: "Lots of white space\nReal skin texture, minimal retouching\nShow the product in use",
    donts: "No pure black backgrounds\nDon't stretch or recolour the logo\nAvoid stock-photo models",
    updated_at: daysAgo(1),
  }),
  client({
    id: "c-northwind",
    name: "Northwind Coffee",
    tagline: "Roasted in small batches",
    industry: "Food & beverage",
    website: "https://northwind-coffee.example",
    description: "Specialty coffee roaster with 4 cafés in Bengaluru and an online subscription.",
    tone_of_voice: "Warm, a little nerdy about coffee, never pretentious.",
    brand_color: "#2F4858",
    status: "paused",
    start_date: "2024-11-15",
    services: ["Social"],
    tags: ["Cafe", "Retail"],
    socials: { instagram: "https://instagram.com/northwind.example" },
    updated_at: daysAgo(21),
  }),
  client({
    id: "c-atlas",
    name: "Atlas Fitness",
    tagline: "Stronger every week",
    industry: "Fitness",
    website: "https://atlasfit.example",
    brand_color: "#F6C90E",
    start_date: "2026-08-01",
    services: ["Social", "SEO"],
    tags: ["New"],
    socials: { instagram: "https://instagram.com/atlasfit.example", youtube: "https://youtube.com/@atlasfit.example" },
    updated_at: daysAgo(4),
  }),
  client({
    id: "c-verdant",
    name: "Verdant Living",
    tagline: "Furniture that grows with you",
    industry: "Home & decor",
    website: "https://verdant.example",
    description: "Sustainable furniture brand. Launching a new outdoor collection in spring.",
    tone_of_voice: "Earthy and honest. Short sentences.",
    brand_color: "#3A6B4C",
    start_date: "2025-09-10",
    services: ["Social", "Content", "Email"],
    tags: ["D2C", "Retainer"],
    updated_at: daysAgo(2),
  }),
  client({
    id: "c-kora",
    name: "Kora Pay",
    tagline: "Payments for small businesses",
    industry: "Fintech",
    website: "https://korapay.example",
    brand_color: "#5B4BDB",
    start_date: "2026-01-20",
    services: ["Paid ads", "Content"],
    tags: ["B2B"],
    socials: { linkedin: "https://linkedin.com/company/korapay-example", x: "https://x.com/korapay_example" },
    updated_at: daysAgo(7),
  }),
  client({
    id: "c-bloom",
    name: "Bloom Bakery",
    industry: "Food & beverage",
    brand_color: "#D96C8A",
    status: "archived",
    services: ["Social"],
    tags: ["Project"],
    updated_at: daysAgo(160),
  }),
];

let n = 0;
const id = (prefix: string) => `${prefix}-${++n}`;

const palettes: Record<string, [string, string, string | null][]> = {
  "c-lumen": [["Peach", "#E8A87C", "Primary"], ["Ink", "#1B1B1E", "Text"], ["Cream", "#FBF6EF", "Backgrounds"], ["Sage", "#A3B18A", "Accents"]],
  "c-northwind": [["Deep Sea", "#2F4858", "Primary"], ["Crema", "#F2E3C6", "Backgrounds"], ["Roast", "#8C5A3C", "Accents"]],
  "c-atlas": [["Volt", "#F6C90E", "Primary"], ["Iron", "#222222", "Backgrounds"], ["Chalk", "#F5F5F5", null]],
  "c-verdant": [["Fern", "#3A6B4C", "Primary"], ["Clay", "#C9A27E", "Secondary"], ["Linen", "#F4EFE6", "Backgrounds"]],
  "c-kora": [["Iris", "#5B4BDB", "Primary"], ["Night", "#14123A", "Text"], ["Mint", "#5ED3B4", "Success, highlights"]],
  "c-bloom": [["Rose", "#D96C8A", "Primary"], ["Butter", "#FFE8A3", "Secondary"]],
};

const brand_colors: BrandColor[] = Object.entries(palettes).flatMap(([client_id, colors]) =>
  colors.map(([name, hex, usage], position) => ({ id: id("col"), client_id, name, hex, usage, position })),
);

const brand_fonts: BrandFont[] = [
  { id: id("font"), client_id: "c-lumen", name: "Playfair Display", weights: "Regular, SemiBold", usage: "Headings", file_url: "https://drive.google.com/drive/folders/sample-lumen-fonts", position: 0 },
  { id: id("font"), client_id: "c-lumen", name: "Inter", weights: "Regular, Medium", usage: "Body", file_url: "https://drive.google.com/drive/folders/sample-lumen-fonts", position: 1 },
  { id: id("font"), client_id: "c-northwind", name: "Fraunces", weights: "Bold", usage: "Headings", file_url: null, position: 0 },
  { id: id("font"), client_id: "c-atlas", name: "Bebas Neue", weights: "Regular", usage: "Headings", file_url: "https://drive.google.com/drive/folders/sample-atlas-fonts", position: 0 },
  { id: id("font"), client_id: "c-verdant", name: "DM Serif Display", weights: "Regular", usage: "Headings", file_url: null, position: 0 },
  { id: id("font"), client_id: "c-kora", name: "Manrope", weights: "Regular, Bold, ExtraBold", usage: "Everything", file_url: "https://drive.google.com/drive/folders/sample-kora-fonts", position: 0 },
];

function link(client_id: string, title: string, url: string, category: string, extra: Partial<Link> = {}): Link {
  return { id: id("link"), client_id, title, url, category, note: null, pinned: false, position: 0, created_by: "u-kabir", created_at: daysAgo(30), ...extra };
}

const links: Link[] = [
  link("c-lumen", "Brand assets — master folder", "https://drive.google.com/drive/folders/sample-lumen-assets", "brand_assets", { pinned: true }),
  link("c-lumen", "Brand guidelines v3", "https://drive.google.com/file/d/sample-lumen-guidelines/view", "guidelines", { pinned: true, note: "Latest version — ignore v2" }),
  link("c-lumen", "Logo pack (SVG, PNG)", "https://drive.google.com/drive/folders/sample-lumen-logos", "logos"),
  link("c-lumen", "Summer 2026 product shoot", "https://drive.google.com/drive/folders/sample-lumen-summer", "media", { note: "Use the selects folder only" }),
  link("c-lumen", "Media library — all shoots", "https://drive.google.com/drive/folders/sample-lumen-media", "media"),
  link("c-lumen", "Instagram post templates", "https://www.figma.com/design/sample-lumen-templates", "templates"),
  link("c-lumen", "Story templates", "https://www.canva.com/design/sample-lumen-stories", "templates"),
  link("c-lumen", "Product catalogue 2026", "https://docs.google.com/presentation/d/sample-lumen-catalogue", "photos"),
  link("c-lumen", "Content calendar", "https://docs.google.com/spreadsheets/d/sample-lumen-calendar", "other"),
  link("c-northwind", "Brand assets", "https://drive.google.com/drive/folders/sample-northwind-assets", "brand_assets", { pinned: true }),
  link("c-northwind", "Café photos", "https://www.dropbox.com/sh/sample-northwind-photos", "photos"),
  link("c-northwind", "Menu designs", "https://www.figma.com/design/sample-northwind-menu", "past_work"),
  link("c-atlas", "Brand kit", "https://drive.google.com/drive/folders/sample-atlas-kit", "brand_assets", { pinned: true }),
  link("c-atlas", "Workout reel footage", "https://drive.google.com/drive/folders/sample-atlas-reels", "media"),
  link("c-verdant", "Brand book", "https://www.notion.so/sample-verdant-brand-book", "guidelines", { pinned: true }),
  link("c-verdant", "Outdoor collection renders", "https://drive.google.com/drive/folders/sample-verdant-outdoor", "photos"),
  link("c-verdant", "Email templates", "https://www.figma.com/design/sample-verdant-email", "templates"),
  link("c-verdant", "Website", "https://verdant.example", "website"),
  link("c-kora", "Brand guidelines", "https://drive.google.com/file/d/sample-kora-guidelines/view", "guidelines", { pinned: true }),
  link("c-kora", "Ad creatives Q3", "https://drive.google.com/drive/folders/sample-kora-ads", "ads"),
  link("c-kora", "Product UI screenshots", "https://drive.google.com/drive/folders/sample-kora-ui", "photos"),
  link("c-bloom", "Final deliverables", "https://drive.google.com/drive/folders/sample-bloom-final", "past_work"),
];

const notes: Note[] = [
  { id: id("note"), client_id: "c-lumen", body: "Client prefers drafts as PDF, not images. Send everything to Meera first; she forwards to the founder.", created_by: "u-riya", created_at: daysAgo(40) },
  { id: id("note"), client_id: "c-lumen", body: "Festive campaigns need approval two weeks ahead.", created_by: "u-kabir", created_at: daysAgo(12) },
  { id: id("note"), client_id: "c-northwind", body: "Paused until the new café opens in December.", created_by: "u-riya", created_at: daysAgo(21) },
  { id: id("note"), client_id: "c-atlas", body: "New client. Kick-off deck and the first month's content plan are in the brand kit folder.", created_by: "u-ananya", created_at: daysAgo(4) },
];

export function seed(): Db {
  return { profiles, clients, brand_colors, brand_fonts, links, notes };
}
