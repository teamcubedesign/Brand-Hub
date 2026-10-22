"use client";

import { useTransition } from "react";
import { deleteClientProfile } from "@/app/actions";

export function DangerZone({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    const typed = prompt(
      `This permanently deletes ${clientName} and all of its links, colours, fonts and notes.\n\nType the client name to confirm.`,
    );
    if (typed?.trim() !== clientName) return;
    startTransition(() => deleteClientProfile(clientId));
  }

  return (
    <section className="mt-10 rounded-2xl border border-danger/30 p-5 sm:p-6">
      <h2 className="font-semibold text-danger">Delete client</h2>
      <p className="mt-1 text-sm text-muted">
        To hide a client without losing anything, set its status to Archived instead.
      </p>
      <button type="button" onClick={remove} disabled={pending} className="btn-danger mt-4">
        {pending ? "Deleting…" : "Delete permanently"}
      </button>
    </section>
  );
}
