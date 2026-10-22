import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Globe, Pencil, Pin } from "lucide-react";
import { ClientLogo } from "@/components/client-logo";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";
import { canEdit, getCurrentUser } from "@/lib/auth";
import { getClient, getClientDetails } from "@/lib/data";
import { categoryLabel, hostOf, LINK_CATEGORIES } from "@/lib/links";
import type { BrandColor, BrandFont, Client, Link as ClientLink, SocialKey } from "@/lib/types";
import { ColorsSection } from "./colors-section";
import { FontsSection } from "./fonts-section";
import { LinksSection } from "./links-section";
import { NotesSection } from "./notes-section";
import { SectionNav } from "./section-nav";

const SOCIAL_LABELS: Record<SocialKey, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X",
  youtube: "YouTube",
  behance: "Behance",
};

const getClientOr404 = cache(async (id: string) => {
  const client = await getClient(id);
  if (!client) notFound();
  return client;
});

export async function generateMetadata({ params }: PageProps<"/clients/[id]">): Promise<Metadata> {
  const client = await getClientOr404((await params).id);
  return { title: client.name };
}

export default async function ClientPage({ params }: PageProps<"/clients/[id]">) {
  const { id } = await params;
  const [user, client, { colors, fonts, links, notes }] = await Promise.all([
    getCurrentUser(),
    getClientOr404(id),
    getClientDetails(id),
  ]);
  const editable = canEdit(user);
  const socials = Object.entries(client.socials) as [SocialKey, string][];
  const dos = splitLines(client.dos);
  const donts = splitLines(client.donts);
  const pinned = links.filter((l) => l.pinned);
  const banner = colors.length ? colors.map((c) => c.hex) : [client.brand_color ?? "var(--color-subtle)"];

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> All clients
      </Link>

      {/* Header */}
      <header className="card overflow-hidden">
        <div className="flex h-20 sm:h-24" aria-hidden>
          {banner.map((hex, i) => (
            <span key={i} className="flex-1" style={{ background: hex }} />
          ))}
        </div>
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-wrap items-end gap-x-4 gap-y-3">
            <ClientLogo
              name={client.name}
              logoUrl={client.logo_url}
              color={client.brand_color}
              className="size-20 text-2xl ring-4 ring-surface"
            />
            <div className="min-w-0 flex-1 basis-48 pt-10">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight">{client.name}</h1>
                <StatusBadge status={client.status} />
              </div>
              {client.tagline && <p className="text-muted">{client.tagline}</p>}
            </div>
            <div className="flex gap-2">
              <CopyButton
                value={brandBrief(client, colors, fonts, links)}
                label="Copy a text summary of this brand kit"
                toastMessage="Brand brief copied. Paste it in a chat or email."
                className="btn-secondary"
              >
                Copy brief
              </CopyButton>
              {editable && (
                <Link href={`/clients/${client.id}/edit`} className="btn-secondary">
                  <Pencil className="size-4" /> Edit
                </Link>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {client.industry && <span>{client.industry}</span>}
            {client.website && (
              <span className="inline-flex items-center gap-1">
                <Globe className="size-4" />
                <a href={client.website} target="_blank" rel="noreferrer" className="text-fg hover:underline">
                  {hostOf(client.website)}
                </a>
                <CopyButton value={client.website} label="Copy website" toastMessage="Website copied" className="icon-btn size-6" />
              </span>
            )}
            {client.start_date && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" /> Client since{" "}
                {new Date(client.start_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </span>
            )}
          </div>

          {(client.services.length > 0 || client.tags.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {client.services.map((s) => (
                <span key={`s-${s}`} className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  {s}
                </span>
              ))}
              {client.tags.map((t) => (
                <span key={`t-${t}`} className="rounded-md bg-subtle px-2 py-0.5 text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>
          )}

          {pinned.length > 0 && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
                <Pin className="size-3.5" /> Start here
              </p>
              <div className="flex flex-wrap gap-2">
                {pinned.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-subtle/60 px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent"
                  >
                    <span className="truncate">{l.title}</span>
                    <ExternalLink className="size-3.5 shrink-0 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <SectionNav
        sections={[
          { id: "overview", label: "Overview" },
          { id: "brand", label: "Brand identity" },
          { id: "resources", label: "Resources", count: links.length },
          { id: "notes", label: "Notes", count: notes.length },
        ]}
      />

      {/* Overview */}
      <section id="overview" className="grid scroll-mt-28 gap-6 lg:grid-cols-3">
        <div className="card min-w-0 p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-semibold">About the brand</h2>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted">
            {client.description ?? "No description yet."}
          </p>
          {client.tone_of_voice && (
            <div className="mt-5 rounded-xl bg-subtle/60 p-4">
              <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Tone of voice</h3>
              <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line">{client.tone_of_voice}</p>
            </div>
          )}
        </div>
        <div className="card min-w-0 p-5 sm:p-6">
          <h2 className="font-semibold">Social profiles</h2>
          {socials.length === 0 ? (
            <p className="mt-2 text-sm text-muted">None added.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {socials.map(([key, url]) => (
                <li key={key} className="flex items-center gap-2 text-sm">
                  <span className="w-20 shrink-0 text-muted">{SOCIAL_LABELS[key]}</span>
                  <a href={url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate hover:underline">
                    {url.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                  <a href={url} target="_blank" rel="noreferrer" className="icon-btn size-7" aria-label={`Open ${SOCIAL_LABELS[key]}`}>
                    <ExternalLink className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Brand identity */}
      <section id="brand" className="scroll-mt-28 space-y-6">
        <ColorsSection clientId={client.id} colors={colors} canEdit={editable} />
        <FontsSection clientId={client.id} fonts={fonts} canEdit={editable} />
        {(dos.length > 0 || donts.length > 0) && (
          <div className="grid gap-6 sm:grid-cols-2">
            <RuleList title="Do" items={dos} tone="success" />
            <RuleList title="Don't" items={donts} tone="danger" />
          </div>
        )}
      </section>

      <section id="resources" className="scroll-mt-28">
        <LinksSection clientId={client.id} links={links} canEdit={editable} />
      </section>

      <section id="notes" className="scroll-mt-28">
        <NotesSection clientId={client.id} notes={notes} canEdit={editable} />
      </section>
    </div>
  );
}

function splitLines(value: string | null) {
  return (value ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** Plain-text brand kit, formatted to paste into WhatsApp, Slack or email. */
function brandBrief(client: Client, colors: BrandColor[], fonts: BrandFont[], links: ClientLink[]) {
  const lines = [`*${client.name}*${client.tagline ? ` — ${client.tagline}` : ""}`];
  if (client.website) lines.push(`Website: ${client.website}`);
  if (client.tone_of_voice) lines.push("", `*Tone of voice*`, client.tone_of_voice);
  if (colors.length) {
    lines.push("", "*Colours*");
    colors.forEach((c) => lines.push(`• ${[c.name, c.hex].filter(Boolean).join(" ")}${c.usage ? ` (${c.usage})` : ""}`));
  }
  if (fonts.length) {
    lines.push("", "*Fonts*");
    fonts.forEach((f) =>
      lines.push(`• ${f.name}${f.usage ? ` — ${f.usage}` : ""}${f.file_url ? `\n  Files: ${f.file_url}` : ""}`),
    );
  }
  if (links.length) {
    lines.push("", "*Links*");
    for (const cat of LINK_CATEGORIES) {
      const inCat = links.filter((l) => l.category === cat.value);
      inCat.forEach((l) => lines.push(`• ${l.title} (${categoryLabel(cat.value)})\n  ${l.url}`));
    }
  }
  return lines.join("\n");
}

function RuleList({ title, items, tone }: { title: string; items: string[]; tone: "success" | "danger" }) {
  const color = tone === "success" ? "text-success" : "text-danger";
  return (
    <div className="card p-5 sm:p-6">
      <h2 className={`font-semibold ${color}`}>{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nothing noted.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5">
              <span className={`${color} font-semibold`} aria-hidden>
                {tone === "success" ? "✓" : "✕"}
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
