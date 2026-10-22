export function normalizeHex(value: string | null | undefined) {
  const raw = value?.trim().replace(/^#/, "") ?? "";
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return /^[0-9a-f]{6}$/i.test(full) ? `#${full.toUpperCase()}` : null;
}

export function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbString(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

/** Naive device CMYK. Good enough as a reference; print specs should come from the brand guide. */
export function cmykString(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return "0, 0, 0, 100";
  const part = (v: number) => Math.round(((1 - v / 255 - k) / (1 - k)) * 100);
  return `${part(r)}, ${part(g)}, ${part(b)}, ${Math.round(k * 100)}`;
}

/** Black or white, whichever reads better on top of the colour. */
export function readableOn(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#FFFFFF";
}
