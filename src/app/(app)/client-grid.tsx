"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FolderOpen, LayoutGrid, Link2, List, Search, X } from "lucide-react";
import { ClientLogo } from "@/components/client-logo";
import { StatusBadge } from "@/components/status-badge";
import type { ClientStatus, ClientSummary } from "@/lib/types";

const STATUS_FILTERS: { value: ClientStatus | "current" | "all"; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];
type Sort = "name" | "updated";
type View = "grid" | "list";

export function ClientGrid({ clients, canEdit }: { clients: ClientSummary[]; canEdit: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("current");
  const [industry, setIndustry] = useState("");
  const [sort, setSort] = useState<Sort>("name");
  const [view, setView] = useState<View>("grid");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" jumps to search from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (e.key !== "/" || target.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const industries = useMemo(
    () => [...new Set(clients.map((c) => c.industry).filter((i): i is string => !!i))].sort(),
    [clients],
  );

  const counts = useMemo(() => {
    const by = (s: ClientStatus) => clients.filter((c) => c.status === s).length;
    return {
      current: clients.length - by("archived"),
      active: by("active"),
      paused: by("paused"),
      archived: by("archived"),
      all: clients.length,
    } satisfies Record<StatusFilter, number>;
  }, [clients]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients
      .filter((c) =>
        status === "all" ? true : status === "current" ? c.status !== "archived" : c.status === status,
      )
      .filter((c) => !industry || c.industry === industry)
      .filter(
        (c) =>
          !q ||
          [c.name, c.tagline, c.industry, ...c.tags, ...c.services]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        sort === "name" ? a.name.localeCompare(b.name) : b.updated_at.localeCompare(a.updated_at),
      );
  }, [clients, query, status, industry, sort]);

  const filtered = query || industry || status !== "current";

  if (clients.length === 0) {
    return (
      <div className="card flex flex-col items-center px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-subtle">
          <FolderOpen className="size-7 text-muted" />
        </span>
        <h2 className="mt-4 font-semibold">No clients yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          {canEdit
            ? "Add your first client to start collecting their brand kit, links and files."
            : "Once an editor adds a client, it will show up here."}
        </p>
        {canEdit && (
          <Link href="/clients/new" className="btn-primary mt-6">
            Add a client
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 space-y-3">
        <label className="relative block">
          <span className="sr-only">Search clients</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search by name, industry, tag or service"
            className="input h-11 pr-12 pl-10 text-[15px]"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-line px-1.5 font-mono text-xs text-muted sm:block">
            /
          </kbd>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="-mx-4 flex max-w-[100vw] overflow-x-auto px-4 sm:mx-0 sm:px-0"
            role="group"
            aria-label="Status"
          >
            <div className="flex rounded-lg border border-line bg-surface p-0.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatus(f.value)}
                  aria-pressed={status === f.value}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors ${
                    status === f.value ? "bg-subtle font-medium" : "text-muted hover:text-fg"
                  }`}
                >
                  {f.label}
                  <span className="text-xs text-muted tabular-nums">{counts[f.value]}</span>
                </button>
              ))}
            </div>
          </div>
          {industries.length > 0 && (
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="input w-auto py-1.5"
              aria-label="Industry"
            >
              <option value="">All industries</option>
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="input w-auto py-1.5"
            aria-label="Sort"
          >
            <option value="name">Name A–Z</option>
            <option value="updated">Recently updated</option>
          </select>
          <div className="ml-auto flex rounded-lg border border-line bg-surface p-0.5">
            {(
              [
                ["grid", LayoutGrid, "Grid view"],
                ["list", List, "List view"],
              ] as const
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={view === value}
                aria-label={label}
                title={label}
                className={`rounded-md p-1.5 ${view === value ? "bg-subtle" : "text-muted hover:text-fg"}`}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <p className="text-sm text-muted">No clients match these filters.</p>
          {filtered && (
            <button
              type="button"
              className="btn-secondary mt-4"
              onClick={() => {
                setQuery("");
                setIndustry("");
                setStatus("current");
              }}
            >
              <X className="size-4" /> Clear filters
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <li key={c.id}>
              <Link
                href={`/clients/${c.id}`}
                className={`card group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 ${
                  c.status === "archived" ? "opacity-70 hover:opacity-100" : ""
                }`}
              >
                <Palette colors={c.palette} fallback={c.brand_color} />
                <span className="flex flex-1 flex-col p-5">
                  <span className="flex items-start gap-3">
                    <ClientLogo name={c.name} logoUrl={c.logo_url} color={c.brand_color} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold group-hover:text-accent">{c.name}</span>
                      <span className="block truncate text-sm text-muted">{c.industry ?? c.tagline ?? "—"}</span>
                    </span>
                    {c.status !== "active" && <StatusBadge status={c.status} />}
                  </span>
                  {c.tags.length > 0 && (
                    <span className="mt-4 flex flex-wrap gap-1.5">
                      {c.tags.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-md bg-subtle px-2 py-0.5 text-xs text-muted">
                          {t}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="mt-auto flex items-center justify-between pt-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Link2 className="size-3.5" />
                      {c.linkCount} {c.linkCount === 1 ? "link" : "links"}
                    </span>
                    <span suppressHydrationWarning>Updated {timeAgo(c.updated_at)}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {visible.map((c) => (
            <li key={c.id}>
              <Link href={`/clients/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-subtle">
                <ClientLogo name={c.name} logoUrl={c.logo_url} color={c.brand_color} className="size-9 text-sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.name}</span>
                  <span className="block truncate text-sm text-muted">{c.industry ?? c.tagline ?? "—"}</span>
                </span>
                <span className="hidden gap-0.5 sm:flex" aria-hidden>
                  {c.palette.slice(0, 5).map((hex, i) => (
                    <span key={i} className="size-4 rounded-full ring-1 ring-black/10" style={{ background: hex }} />
                  ))}
                </span>
                <span className="hidden w-16 text-right text-xs text-muted sm:block">{c.linkCount} links</span>
                <span suppressHydrationWarning className="hidden w-28 text-right text-xs text-muted md:block">
                  {timeAgo(c.updated_at)}
                </span>
                <StatusBadge status={c.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Thin stripe of the brand palette across the top of a card. */
function Palette({ colors, fallback }: { colors: string[]; fallback: string | null }) {
  const stripe = colors.length ? colors.slice(0, 6) : [fallback ?? "var(--color-line)"];
  return (
    <span className="flex h-2" aria-hidden>
      {stripe.map((hex, i) => (
        <span key={i} className="flex-1" style={{ background: hex }} />
      ))}
    </span>
  );
}

function timeAgo(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit);
  }
  return "just now";
}
