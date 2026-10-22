"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteColor, saveColor } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast";
import { FormButtons, FormError, SectionCard, useFormAction } from "@/components/section-card";
import { cmykString, normalizeHex, readableOn, rgbString } from "@/lib/colors";
import type { BrandColor } from "@/lib/types";

export function ColorsSection({
  clientId,
  colors,
  canEdit,
}: {
  clientId: string;
  colors: BrandColor[];
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState<BrandColor | "new" | null>(null);

  return (
    <SectionCard
      title="Colour palette"
      description="Click any value to copy it."
      onAdd={canEdit ? () => setEditing("new") : undefined}
      addLabel="Add colour"
    >
      {editing && (
        <ColorForm
          key={editing === "new" ? "new" : editing.id}
          clientId={clientId}
          color={editing === "new" ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      )}
      {colors.length === 0 && !editing ? (
        <p className="text-sm text-muted">No colours added yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {colors.map((c) => (
            <Swatch key={c.id} color={c} clientId={clientId} canEdit={canEdit} onEdit={() => setEditing(c)} />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function Swatch({
  color,
  clientId,
  canEdit,
  onEdit,
}: {
  color: BrandColor;
  clientId: string;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const fg = readableOn(color.hex);
  const values = [
    ["HEX", color.hex],
    ["RGB", rgbString(color.hex)],
    ["CMYK", cmykString(color.hex)],
  ];

  return (
    <li className={`overflow-hidden rounded-xl border border-line ${pending ? "opacity-50" : ""}`}>
      <div className="relative flex h-20 items-end p-2.5" style={{ background: color.hex, color: fg }}>
        <span className="text-sm font-medium">{color.name ?? color.hex}</span>
        {canEdit && (
          <span className="absolute top-1.5 right-1.5 flex gap-0.5">
            <button
              type="button"
              onClick={onEdit}
              className="grid size-7 place-items-center rounded-md hover:bg-black/10"
              style={{ color: fg }}
              aria-label="Edit colour"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Remove ${color.name ?? color.hex}?`)) startTransition(async () => {
                    await deleteColor(clientId, color.id);
                    toast("Colour removed");
                  });
              }}
              className="grid size-7 place-items-center rounded-md hover:bg-black/10"
              style={{ color: fg }}
              aria-label="Delete colour"
            >
              <Trash2 className="size-3.5" />
            </button>
          </span>
        )}
      </div>
      <div className="space-y-0.5 p-2">
        {values.map(([label, value]) => (
          <CopyButton
            key={label}
            value={value}
            label={`Copy ${label}`}
            className="group flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs hover:bg-subtle [&>svg]:size-3 [&>svg]:text-muted [&>svg]:opacity-0 group-hover:[&>svg]:opacity-100"
          >
            <span className="w-9 text-muted">{label}</span>
            <span className="flex-1 font-mono">{value}</span>
          </CopyButton>
        ))}
        {color.usage && <p className="px-1.5 pt-1 text-xs text-muted">{color.usage}</p>}
      </div>
    </li>
  );
}

function ColorForm({ clientId, color, onDone }: { clientId: string; color?: BrandColor; onDone: () => void }) {
  const [state, onSubmit, pending] = useFormAction(saveColor.bind(null, clientId), onDone, color ? "Colour updated" : "Colour added");
  const [hex, setHex] = useState(color?.hex ?? "");

  return (
    <form onSubmit={onSubmit} className="mb-5 space-y-3 rounded-xl border border-line bg-subtle/50 p-4">
      {color && <input type="hidden" name="id" value={color.id} />}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="color-hex">
            HEX
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Pick colour"
              value={normalizeHex(hex) ?? "#000000"}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1"
            />
            <input
              id="color-hex"
              name="hex"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              placeholder="#1A2B3C"
              className="input font-mono"
              required
              autoFocus
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="color-name">
            Name
          </label>
          <input id="color-name" name="name" defaultValue={color?.name ?? ""} placeholder="e.g. Ocean Blue" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="color-usage">
            Usage
          </label>
          <input id="color-usage" name="usage" defaultValue={color?.usage ?? ""} placeholder="e.g. Primary, CTAs" className="input" />
        </div>
      </div>
      <FormError state={state} />
      <FormButtons pending={pending} onCancel={onDone} saveLabel={color ? "Save" : "Add colour"} />
    </form>
  );
}
