"use client";

import { useTransition } from "react";
import { setUserRole } from "@/app/actions";
import { useToast } from "@/components/toast";
import type { UserRole } from "@/lib/types";

export function RoleSelect({ userId, role, name }: { userId: string; role: UserRole; name: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <select
      defaultValue={role}
      disabled={pending}
      aria-label={`Role for ${name}`}
      onChange={(e) => {
        const next = e.target.value as UserRole;
        startTransition(async () => {
          await setUserRole(userId, next);
          toast(`${name} is now ${next === "admin" ? "an admin" : `a ${next}`}`);
        });
      }}
      className="input w-auto py-1.5"
    >
      <option value="admin">Admin</option>
      <option value="editor">Editor</option>
      <option value="viewer">Viewer</option>
    </select>
  );
}
