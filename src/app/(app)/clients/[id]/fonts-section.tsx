"use client";

import { useState, useTransition } from "react";
import { Download, Pencil, Trash2 } from "lucide-react";
import { deleteFont, saveFont } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast";
import { FormButtons, FormError, SectionCard, useFormAction } from "@/components/section-card";
import type { BrandFont } from "@/lib/types";

export function FontsSection({
  clientId,
  fonts,
  canEdit,
}: {
  clientId: string;
  fonts: BrandFont[];
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState<BrandFont | "new" | null>(null);

  return (
    <SectionCard
      title="Typography"
      description="Previews use the font if it's installed on your computer."
      onAdd={canEdit ? () => setEditing("new") : undefined}
      addLabel="Add font"
    >
      {editing && (
        <FontForm
          key={editing === "new" ? "new" : editing.id}
          clientId={clientId}
          font={editing === "new" ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      )}
      {fonts.length === 0 && !editing ? (
        <p className="text-sm text-muted">No fonts added yet.</p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {fonts.map((f) => (
            <FontRow key={f.id} font={f} clientId={clientId} canEdit={canEdit} onEdit={() => setEditing(f)} />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function FontRow({
  font,
  clientId,
  canEdit,
  onEdit,
}: {
  font: BrandFont;
  clientId: string;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <li className={`flex flex-wrap items-center gap-x-4 gap-y-2 p-4 ${pending ? "opacity-50" : ""}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-2xl" style={{ fontFamily: `"${font.name}", var(--font-sans)` }}>
          {font.name}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {[font.usage, font.weights].filter(Boolean).join(" · ") || "No usage noted"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <CopyButton value={font.name} label="Copy font name" />
        {font.file_url && (
          <a href={font.file_url} target="_blank" rel="noreferrer" className="btn-secondary py-1.5">
            <Download className="size-4" /> Font files
          </a>
        )}
        {canEdit && (
          <>
            <button type="button" className="icon-btn" aria-label="Edit font" onClick={onEdit}>
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              className="icon-btn hover:text-danger"
              aria-label="Delete font"
              onClick={() => {
                if (confirm(`Remove ${font.name}?`)) startTransition(async () => {
                    await deleteFont(clientId, font.id);
                    toast("Font removed");
                  });
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function FontForm({ clientId, font, onDone }: { clientId: string; font?: BrandFont; onDone: () => void }) {
  const [state, onSubmit, pending] = useFormAction(saveFont.bind(null, clientId), onDone, font ? "Font updated" : "Font added");

  return (
    <form onSubmit={onSubmit} className="mb-5 space-y-3 rounded-xl border border-line bg-subtle/50 p-4">
      {font && <input type="hidden" name="id" value={font.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="font-name">
            Font name
          </label>
          <input id="font-name" name="name" defaultValue={font?.name} placeholder="e.g. Poppins" className="input" required autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="font-usage">
            Usage
          </label>
          <input id="font-usage" name="usage" defaultValue={font?.usage ?? ""} placeholder="e.g. Headings" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="font-weights">
            Weights
          </label>
          <input id="font-weights" name="weights" defaultValue={font?.weights ?? ""} placeholder="e.g. Regular, SemiBold, Bold" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="font-file">
            Font files link
          </label>
          <input id="font-file" name="file_url" defaultValue={font?.file_url ?? ""} placeholder="Drive folder with the font files" className="input" />
        </div>
      </div>
      <FormError state={state} />
      <FormButtons pending={pending} onCancel={onDone} saveLabel={font ? "Save" : "Add font"} />
    </form>
  );
}
