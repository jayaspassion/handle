// Light/dark handling shared by the toggle, the dashboard and the public page.
// The visitor's own choice lives in localStorage; without one, the page's
// <html data-theme> decides (light by default, or a public page owner's mode).
import type { ColorMode, FontId, ThemeId } from "@/lib/appearance";

export const KEY = "handle-theme";
export const EVENT = "handle-theme-change";

export function savedMode(): ColorMode | null {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" || saved === "system" ? saved : null;
  } catch {
    return null;
  }
}

// What is showing right now
export function currentMode(): ColorMode {
  const saved = savedMode();
  if (saved) return saved;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : attr === "light" ? "light" : "system";
}

export function applyMode(mode: ColorMode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  window.dispatchEvent(new Event(EVENT));
}

export function saveMode(mode: ColorMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {}
  applyMode(mode);
}

// Inline script for a public page's first paint (see OwnerAppearance)
export function ownerAppearanceScript({
  mode,
  theme,
  font,
}: {
  mode: ColorMode | null;
  theme: ThemeId;
  font: FontId;
}) {
  // Values come from the fixed lists in lib/appearance.ts
  return `try{var r=document.documentElement;r.setAttribute("data-pf-theme",${JSON.stringify(theme)});r.setAttribute("data-pf-font",${JSON.stringify(font)});var m=${JSON.stringify(mode)};if(m&&!localStorage.getItem("${KEY}")){if(m==="system")r.removeAttribute("data-theme");else r.setAttribute("data-theme",m)}}catch(e){}`;
}
