"use client";

import { useEffect, useState } from "react";

type Section = { id: string; label: string; count?: number };

/** Sticky in-page tabs that highlight the section you're reading. */
export function SectionNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      // A band just under the sticky header counts as "reading".
      { rootMargin: "-120px 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="sticky top-14 z-10 -mx-4 border-b border-line bg-bg/90 px-4 backdrop-blur-md sm:mx-0 sm:rounded-b-xl sm:px-1">
      <div className="flex gap-1 overflow-x-auto py-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={active === s.id ? "true" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
              active === s.id ? "bg-surface font-medium text-fg shadow-sm ring-1 ring-line" : "text-muted hover:text-fg"
            }`}
          >
            {s.label}
            {s.count !== undefined && <span className="text-xs text-muted tabular-nums">{s.count}</span>}
          </a>
        ))}
      </div>
    </nav>
  );
}
