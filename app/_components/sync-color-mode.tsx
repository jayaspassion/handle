"use client";

import { useEffect } from "react";
import type { ColorMode, FontId, ThemeId } from "@/lib/appearance";
import { applyMode, saveMode, savedMode } from "./color-mode";

// Dashboard: apply the mode saved on the account (e.g. on a new device)
export function AccountColorMode({ mode }: { mode: ColorMode | null }) {
  useEffect(() => {
    if (mode && savedMode() !== mode) saveMode(mode);
  }, [mode]);
  return null;
}

// Public page: put the owner's theme and font on <html> (so the site header
// matches) and use their mode as the default unless the visitor chose one.
// ownerAppearanceScript() (color-mode.ts) handles the first paint; this covers client
// navigation and resets everything when leaving the page.
type Owner = { mode: ColorMode | null; theme: ThemeId; font: FontId };

export function OwnerAppearance({ mode, theme, font }: Owner) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-pf-theme", theme);
    root.setAttribute("data-pf-font", font);
    if (mode && !savedMode()) applyMode(mode);
    return () => {
      root.removeAttribute("data-pf-theme");
      root.removeAttribute("data-pf-font");
      if (mode && !savedMode()) applyMode("light");
    };
  }, [mode, theme, font]);
  return null;
}
