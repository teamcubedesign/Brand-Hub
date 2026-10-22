import type { Profile } from "@/lib/types";

// Stable colour per person, so the same teammate always looks the same.
const COLORS = ["#E8A87C", "#5B4BDB", "#3A6B4C", "#2F4858", "#D96C8A", "#C9A227", "#0E7490"];

export function Avatar({ profile, className = "size-8 text-sm" }: { profile: Pick<Profile, "id" | "full_name" | "email" | "avatar_url">; className?: string }) {
  const name = profile.full_name ?? profile.email;

  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className={`shrink-0 rounded-full ${className}`} />
    );
  }

  const hash = [...profile.id].reduce((h, c) => h + c.charCodeAt(0), 0);
  const initials = name
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${className}`}
      style={{ background: COLORS[hash % COLORS.length] }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
