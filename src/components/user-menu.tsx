"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, LogOut } from "lucide-react";
import { signOut, switchUser } from "@/app/auth-actions";
import type { Profile } from "@/lib/types";
import { Avatar } from "./avatar";

export function UserMenu({ user, team }: { user: Profile; team: Profile[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg py-1 pr-1.5 pl-1 hover:bg-subtle"
      >
        <Avatar profile={user} className="size-7 text-xs" />
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-sm font-medium">{user.full_name ?? user.email}</span>
          <span className="block text-xs text-muted capitalize">{user.role}</span>
        </span>
        <ChevronDown className="size-4 text-muted" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium">{user.full_name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>

          {/* Mock only: preview the app as other people and roles. */}
          <div className="border-b border-line py-1.5">
            <p className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-muted">
              Preview as
              <span className="rounded bg-warn/15 px-1.5 py-px text-[10px] font-semibold tracking-wide text-warn uppercase">
                Demo
              </span>
            </p>
            {team.map((member) => (
              <button
                key={member.id}
                type="button"
                role="menuitem"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await switchUser(member.id);
                    setOpen(false);
                    router.refresh();
                  })
                }
                className="flex w-full items-center gap-3 px-4 py-1.5 text-left text-sm hover:bg-subtle disabled:opacity-60"
              >
                <Avatar profile={member} className="size-6 text-[10px]" />
                <span className="min-w-0 flex-1 truncate">{member.full_name}</span>
                <span className="text-xs text-muted capitalize">{member.role}</span>
                <Check className={`size-4 ${member.id === user.id ? "text-accent" : "invisible"}`} />
              </button>
            ))}
          </div>

          <form action={signOut} className="py-1.5">
            <button role="menuitem" className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-subtle">
              <LogOut className="size-4 text-muted" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
