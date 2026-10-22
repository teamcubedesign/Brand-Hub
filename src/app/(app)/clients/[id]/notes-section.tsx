"use client";

import { useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addNote, deleteNote } from "@/app/actions";
import { FormError, SectionCard, useFormAction } from "@/components/section-card";
import { useToast } from "@/components/toast";
import type { NoteWithAuthor as Note } from "@/lib/types";

export function NotesSection({ clientId, notes, canEdit }: { clientId: string; notes: Note[]; canEdit: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, onSubmit, pending] = useFormAction(addNote.bind(null, clientId), () => formRef.current?.reset(), "Note added");

  return (
    <SectionCard title="Notes" description="Client preferences, feedback and anything a new designer should know.">
      {canEdit && (
        <form ref={formRef} onSubmit={onSubmit} className="mb-5 space-y-2">
          <label htmlFor="note-body" className="sr-only">
            New note
          </label>
          <textarea
            id="note-body"
            name="body"
            rows={3}
            placeholder="e.g. Client prefers drafts as PDF. Festive campaigns need approval two weeks ahead."
            className="input resize-y"
          />
          <div className="flex items-center justify-between gap-4">
            <FormError state={state} />
            <button type="submit" disabled={pending} className="btn-primary ml-auto">
              {pending ? "Adding…" : "Add note"}
            </button>
          </div>
        </form>
      )}
      {notes.length === 0 ? (
        <p className="text-sm text-muted">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} clientId={clientId} canEdit={canEdit} />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function NoteItem({ note, clientId, canEdit }: { note: Note; clientId: string; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const author = note.author?.full_name ?? note.author?.email ?? "Former member";

  return (
    <li className={`rounded-xl bg-subtle/60 p-4 ${pending ? "opacity-50" : ""}`}>
      <p className="text-sm whitespace-pre-line">{note.body}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-muted">
        <span>
          {author} ·{" "}
          {new Date(note.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        {canEdit && (
          <button
            type="button"
            className="icon-btn size-7 hover:text-danger"
            aria-label="Delete note"
            onClick={() => {
              if (confirm("Delete this note?")) startTransition(async () => {
                await deleteNote(clientId, note.id);
                toast("Note deleted");
              });
            }}
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}
