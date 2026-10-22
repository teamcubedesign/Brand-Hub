"use client";

import { useState } from "react";
import { readableOn } from "@/lib/colors";
import { displayImageUrl } from "@/lib/links";

/** Logo from a pasted URL (Drive links included), falling back to initials. */
export function ClientLogo({
  name,
  logoUrl,
  color,
  className = "size-12 text-base",
}: {
  name: string;
  logoUrl: string | null;
  color: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = displayImageUrl(logoUrl);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name} logo`}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-xl border border-line bg-white object-contain p-1 ${className}`}
      />
    );
  }

  const bg = color ?? "#71717A";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl font-semibold ${className}`}
      style={{ background: bg, color: readableOn(bg) }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
