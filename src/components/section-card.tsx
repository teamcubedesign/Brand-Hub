"use client";

import { startTransition, useActionState } from "react";
import { Plus } from "lucide-react";
import type { ActionResult } from "@/lib/types";
import { useToast } from "./toast";

export function SectionCard({
  title,
  description,
  onAdd,
  addLabel = "Add",
  children,
}: {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {onAdd && (
          <button type="button" onClick={onAdd} className="btn-secondary shrink-0 py-1.5">
            <Plus className="size-4" /> {addLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * Runs a server action from a form's onSubmit, then calls onSuccess and shows
 * a toast when it returns no error.
 *
 * Uses onSubmit rather than <form action>, because React resets a form after
 * an action runs, which would wipe what the user typed when validation fails.
 */
export function useFormAction(action: Action, onSuccess?: () => void, successMessage?: string) {
  const toast = useToast();
  const [state, dispatch, pending] = useActionState<ActionResult, FormData>(async (prev, formData) => {
    const result = await action(prev, formData);
    if (!result?.error) {
      onSuccess?.();
      if (successMessage) toast(successMessage);
    }
    return result;
  }, undefined);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return [state, onSubmit, pending] as const;
}

export function FormError({ state }: { state: ActionResult }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {state.error}
    </p>
  );
}

export function FormButtons({ pending, onCancel, saveLabel = "Save" }: { pending: boolean; onCancel: () => void; saveLabel?: string }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="btn-ghost">
        Cancel
      </button>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : saveLabel}
      </button>
    </div>
  );
}
