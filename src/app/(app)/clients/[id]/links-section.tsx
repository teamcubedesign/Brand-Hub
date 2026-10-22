"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Box,
  Cloud,
  ExternalLink,
  FileText,
  FolderOpen,
  MoreVertical,
  Globe,
  NotebookText,
  Palette,
  PenTool,
  Pencil,
  Pin,
  PinOff,
  Play,
  Presentation,
  Search,
  Send,
  Sheet,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { deleteLink, saveLink, toggleLinkPin } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast";
import { FormButtons, FormError, SectionCard, useFormAction } from "@/components/section-card";
import {
  categoryLabel,
  detectProvider,
  hostOf,
  LINK_CATEGORIES,
  PROVIDER_LABELS,
  type Provider,
} from "@/lib/links";
import type { Link } from "@/lib/types";

const PROVIDER_STYLE: Record<Provider, { icon: LucideIcon; color: string }> = {
  drive: { icon: FolderOpen, color: "#1FA463" },
  docs: { icon: FileText, color: "#4285F4" },
  sheets: { icon: Sheet, color: "#0F9D58" },
  slides: { icon: Presentation, color: "#F4B400" },
  figma: { icon: PenTool, color: "#A259FF" },
  canva: { icon: Palette, color: "#00C4CC" },
  dropbox: { icon: Box, color: "#0061FF" },
  notion: { icon: NotebookText, color: "#71717A" },
  youtube: { icon: Play, color: "#FF0000" },
  onedrive: { icon: Cloud, color: "#0078D4" },
  wetransfer: { icon: Send, color: "#409FFF" },
  web: { icon: Globe, color: "#71717A" },
};

export function LinksSection({ clientId, links, canEdit }: { clientId: string; links: Link[]; canEdit: boolean }) {
  const [editing, setEditing] = useState<Link | "new" | null>(null);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matching = links.filter(
      (l) => !q || [l.title, l.url, l.note, categoryLabel(l.category)].some((v) => v?.toLowerCase().includes(q)),
    );
    const result: { key: string; label: string; links: Link[] }[] = [];
    const pinned = matching.filter((l) => l.pinned);
    if (pinned.length) result.push({ key: "pinned", label: "Pinned", links: pinned });
    for (const cat of LINK_CATEGORIES) {
      const inCat = matching.filter((l) => !l.pinned && (l.category === cat.value || (cat.value === "other" && !LINK_CATEGORIES.some((c) => c.value === l.category))));
      if (inCat.length) result.push({ key: cat.value, label: cat.label, links: inCat });
    }
    return result;
  }, [links, query]);

  return (
    <SectionCard
      title="Resources and links"
      description="Drive folders, media libraries, templates and anything else the client shared."
      onAdd={canEdit ? () => setEditing("new") : undefined}
      addLabel="Add link"
    >
      {editing === "new" && (
        <LinkForm clientId={clientId} onDone={() => setEditing(null)} />
      )}

      {links.length === 0 && editing !== "new" ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          No links yet.{canEdit && " Paste the client's Drive folders, media library and templates here."}
        </p>
      ) : (
        <>
          {links.length > 6 && (
            <label className="relative mb-4 block">
              <span className="sr-only">Filter links</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter links"
                className="input pl-9"
              />
            </label>
          )}
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.key}>
                <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
                  {group.label} <span className="font-normal">· {group.links.length}</span>
                </h3>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {group.links.map((link) =>
                    editing !== "new" && editing?.id === link.id ? (
                      <li key={link.id} className="p-3">
                        <LinkForm clientId={clientId} link={link} onDone={() => setEditing(null)} />
                      </li>
                    ) : (
                      <LinkRow
                        key={link.id}
                        link={link}
                        clientId={clientId}
                        canEdit={canEdit}
                        onEdit={() => setEditing(link)}
                      />
                    ),
                  )}
                </ul>
              </div>
            ))}
            {groups.length === 0 && <p className="text-sm text-muted">No links match “{query}”.</p>}
          </div>
        </>
      )}
    </SectionCard>
  );
}

function LinkRow({
  link,
  clientId,
  canEdit,
  onEdit,
}: {
  link: Link;
  clientId: string;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const provider = detectProvider(link.url);
  const { icon: Icon, color } = PROVIDER_STYLE[provider];

  return (
    <li className={`flex items-center gap-3 px-3 py-2.5 ${pending ? "opacity-50" : ""}`}>
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg"
        style={{ background: `${color}1A`, color }}
        title={PROVIDER_LABELS[provider]}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <a href={link.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium hover:underline">
          {link.title}
        </a>
        <p className="truncate text-xs text-muted">
          {link.note ? link.note : `${PROVIDER_LABELS[provider]} · ${hostOf(link.url)}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center">
        <CopyButton value={link.url} label="Copy link" />
        <a href={link.url} target="_blank" rel="noreferrer" className="icon-btn" title="Open" aria-label="Open link">
          <ExternalLink className="size-4" />
        </a>
        {canEdit && (
          <EditActions
            pinned={link.pinned}
            onPin={() =>
              startTransition(async () => {
                await toggleLinkPin(clientId, link.id, !link.pinned);
                toast(link.pinned ? "Unpinned" : "Pinned to Start here");
              })
            }
            onEdit={onEdit}
            onDelete={() => {
              if (!confirm(`Remove “${link.title}”?`)) return;
              startTransition(async () => {
                await deleteLink(clientId, link.id);
                toast("Link removed");
              });
            }}
          />
        )}
      </div>
    </li>
  );
}

/** Pin, edit and delete: inline buttons on wider screens, a "more" menu on phones. */
function EditActions({
  pinned,
  onPin,
  onEdit,
  onDelete,
}: {
  pinned: boolean;
  onPin: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: pinned ? "Unpin" : "Pin to top", icon: pinned ? PinOff : Pin, run: onPin, danger: false },
    { label: "Edit", icon: Pencil, run: onEdit, danger: false },
    { label: "Delete", icon: Trash2, run: onDelete, danger: true },
  ];

  return (
    <>
      <span className="hidden sm:contents">
        {items.map(({ label, icon: Icon, run, danger }) => (
          <button
            key={label}
            type="button"
            className={`icon-btn ${danger ? "hover:text-danger" : ""}`}
            title={label}
            aria-label={`${label} link`}
            onClick={run}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </span>
      <span className="relative sm:hidden">
        <button
          type="button"
          className="icon-btn"
          aria-label="More actions"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onBlur={(e) => !e.currentTarget.parentElement?.contains(e.relatedTarget) && setOpen(false)}
        >
          <MoreVertical className="size-4" />
        </button>
        {open && (
          <span className="absolute right-0 z-10 mt-1 flex w-40 flex-col overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg">
            {items.map(({ label, icon: Icon, run, danger }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  run();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-subtle ${danger ? "text-danger" : ""}`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </span>
        )}
      </span>
    </>
  );
}

function LinkForm({ clientId, link, onDone }: { clientId: string; link?: Link; onDone: () => void }) {
  const [state, onSubmit, pending] = useFormAction(saveLink.bind(null, clientId), onDone, link ? "Link updated" : "Link added");
  const [url, setUrl] = useState(link?.url ?? "");
  const [category, setCategory] = useState(link?.category ?? "");
  const provider = url ? detectProvider(url.startsWith("http") ? url : `https://${url}`) : null;

  // Guess a category from the URL until the user picks one themselves.
  const guessed = !category && provider ? guessCategory(url) : null;

  return (
    <form onSubmit={onSubmit} className="mb-5 space-y-3 rounded-xl border border-line bg-subtle/50 p-4">
      {link && <input type="hidden" name="id" value={link.id} />}
      <div>
        <label className="label" htmlFor={`url-${link?.id ?? "new"}`}>
          Link
        </label>
        <input
          id={`url-${link?.id ?? "new"}`}
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a Google Drive, Figma, Canva or any other link"
          className="input"
          autoFocus
          required
        />
        {provider && provider !== "web" && (
          <p className="mt-1 text-xs text-muted">Detected: {PROVIDER_LABELS[provider]}</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`title-${link?.id ?? "new"}`}>
            Title
          </label>
          <input
            id={`title-${link?.id ?? "new"}`}
            name="title"
            defaultValue={link?.title}
            placeholder="e.g. Product shoot — Summer 2026"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor={`category-${link?.id ?? "new"}`}>
            Category
          </label>
          <select
            id={`category-${link?.id ?? "new"}`}
            name="category"
            value={category || guessed || "other"}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {LINK_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`note-${link?.id ?? "new"}`}>
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id={`note-${link?.id ?? "new"}`}
          name="note"
          defaultValue={link?.note ?? ""}
          placeholder="e.g. Use only the 2026 folder; older logos are outdated"
          className="input"
        />
      </div>
      <FormError state={state} />
      <FormButtons pending={pending} onCancel={onDone} saveLabel={link ? "Save" : "Add link"} />
    </form>
  );
}

function guessCategory(url: string) {
  const u = url.toLowerCase();
  if (/font/.test(u)) return "fonts";
  if (/logo/.test(u)) return "logos";
  if (/guideline|brand.?book|brand.?guide/.test(u)) return "guidelines";
  if (/figma\.com|canva\.com|template/.test(u)) return "templates";
  if (/instagram|facebook|linkedin|tiktok/.test(u)) return "social";
  return null;
}
