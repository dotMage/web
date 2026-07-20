// UI scale — everything in the panel is sized in px, so we scale the whole
// document with CSS `zoom` (supported in all current browsers) rather than
// touching a root font-size. Applied before React mounts to avoid a flash.

const KEY = 'dotmage:scale';
export const SCALES = [1, 1.15, 1.3, 1.5] as const;
export type Scale = (typeof SCALES)[number];

export function getScale(): Scale {
  const v = Number(localStorage.getItem(KEY));
  return (SCALES as readonly number[]).includes(v) ? (v as Scale) : 1;
}

export function setScale(s: Scale): void {
  localStorage.setItem(KEY, String(s));
  applyScale(s);
}

export function applyScale(s: Scale = getScale()): void {
  // `zoom` scales layout (unlike transform) and keeps the page flow intact.
  document.documentElement.style.zoom = String(s);
}
