"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormAction } from "@/components/section-card";
import { normalizeHex } from "@/lib/colors";
import type { ActionResult, Client, SocialKey } from "@/lib/types";

const SOCIALS: { key: SocialKey; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/brand" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/company/brand" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/brand" },
  { key: "x", label: "X / Twitter", placeholder: "x.com/brand" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@brand" },
  { key: "behance", label: "Behance", placeholder: "behance.net/brand" },
];

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

export function ClientForm({
  action,
  client,
  cancelHref,
}: {
  action: Action;
  client?: Client;
  cancelHref: string;
}) {
  const [state, onSubmit, pending] = useFormAction(action);
  const [color, setColor] = useState(client?.brand_color ?? "");

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="Basics" description="Only the name is required. You can fill in the rest later.">
        <Field label="Client name" name="name" defaultValue={client?.name} required autoFocus />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Industry" name="industry" defaultValue={client?.industry} placeholder="e.g. Skincare" />
          <Field label="Tagline" name="tagline" defaultValue={client?.tagline} />
          <Field label="Website" name="website" defaultValue={client?.website} placeholder="brand.com" />
          <Field
            label="Logo URL"
            name="logo_url"
            defaultValue={client?.logo_url}
            placeholder="Drive or image link"
            hint="Drive files must be shared with the team to show up."
          />
          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select id="status" name="status" defaultValue={client?.status ?? "active"} className="input">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <Field label="Start date" name="start_date" type="date" defaultValue={client?.start_date} />
        </div>
        <TextArea
          label="About the brand"
          name="description"
          defaultValue={client?.description}
          placeholder="What they do, who they sell to, what makes them different."
        />
      </Section>

      <Section title="Brand" description="Colours and fonts are added on the profile page once the client exists.">
        <div>
          <label className="label" htmlFor="brand_color">
            Primary brand colour
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Pick colour"
              value={normalizeHex(color) ?? "#000000"}
              onChange={(e) => setColor(e.target.value.toUpperCase())}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1"
            />
            <input
              id="brand_color"
              name="brand_color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#4F46E5"
              className="input font-mono"
            />
          </div>
        </div>
        <TextArea
          label="Tone of voice"
          name="tone_of_voice"
          defaultValue={client?.tone_of_voice}
          placeholder="e.g. Warm, witty, never salesy. Uses British spelling."
          rows={2}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea label="Do's" name="dos" defaultValue={client?.dos} placeholder="One per line" />
          <TextArea label="Don'ts" name="donts" defaultValue={client?.donts} placeholder="One per line" />
        </div>
      </Section>

      <Section title="Work and tags">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Services we provide"
            name="services"
            defaultValue={client?.services.join(", ")}
            placeholder="Social, Paid ads, SEO"
            hint="Separate with commas."
          />
          <Field
            label="Tags"
            name="tags"
            defaultValue={client?.tags.join(", ")}
            placeholder="D2C, Retainer"
            hint="Separate with commas."
          />
        </div>
      </Section>

      <Section title="Social profiles">
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIALS.map((s) => (
            <Field
              key={s.key}
              label={s.label}
              name={`social_${s.key}`}
              defaultValue={client?.socials[s.key]}
              placeholder={s.placeholder}
            />
          ))}
        </div>
      </Section>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <Link href={cancelHref} className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : client ? "Save changes" : "Create client"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  hint,
  ...props
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} defaultValue={defaultValue ?? ""} className="input" {...props} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        rows={rows}
        className="input resize-y"
      />
    </div>
  );
}
