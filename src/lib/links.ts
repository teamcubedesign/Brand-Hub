export const LINK_CATEGORIES = [
  { value: "media", label: "Media library" },
  { value: "brand_assets", label: "Brand assets" },
  { value: "logos", label: "Logos" },
  { value: "fonts", label: "Fonts" },
  { value: "guidelines", label: "Brand guidelines" },
  { value: "templates", label: "Templates" },
  { value: "photos", label: "Product photos" },
  { value: "past_work", label: "Past work" },
  { value: "social", label: "Social media" },
  { value: "ads", label: "Ads" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
] as const;

export function categoryLabel(value: string) {
  return LINK_CATEGORIES.find((c) => c.value === value)?.label ?? "Other";
}

export type Provider =
  | "drive"
  | "docs"
  | "sheets"
  | "slides"
  | "figma"
  | "canva"
  | "dropbox"
  | "notion"
  | "youtube"
  | "onedrive"
  | "wetransfer"
  | "web";

export const PROVIDER_LABELS: Record<Provider, string> = {
  drive: "Google Drive",
  docs: "Google Docs",
  sheets: "Google Sheets",
  slides: "Google Slides",
  figma: "Figma",
  canva: "Canva",
  dropbox: "Dropbox",
  notion: "Notion",
  youtube: "YouTube",
  onedrive: "OneDrive",
  wetransfer: "WeTransfer",
  web: "Website",
};

export function detectProvider(url: string): Provider {
  let host: string;
  let path: string;
  try {
    ({ hostname: host, pathname: path } = new URL(url));
  } catch {
    return "web";
  }
  host = host.replace(/^www\./, "");

  if (host === "docs.google.com") {
    if (path.startsWith("/spreadsheets")) return "sheets";
    if (path.startsWith("/presentation")) return "slides";
    return "docs";
  }
  if (host === "drive.google.com") return "drive";
  if (host.endsWith("figma.com")) return "figma";
  if (host.endsWith("canva.com")) return "canva";
  if (host.endsWith("dropbox.com")) return "dropbox";
  if (host.endsWith("notion.so") || host.endsWith("notion.site")) return "notion";
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
  if (host === "1drv.ms" || host.endsWith("sharepoint.com") || host.endsWith("onedrive.live.com"))
    return "onedrive";
  if (host === "we.tl" || host.endsWith("wetransfer.com")) return "wetransfer";
  return "web";
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Adds https:// when someone pastes "example.com". Returns null for blanks. */
export function normalizeUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Google Drive share links open a viewer page, not the image itself.
 * Turn them into a thumbnail URL so logos render (file must be shared
 * with "anyone with the link" or with the viewer's Google account).
 */
export function displayImageUrl(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "drive.google.com") {
      const id =
        parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ??
        parsed.searchParams.get("id");
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w400`;
    }
  } catch {
    return null;
  }
  return url;
}
