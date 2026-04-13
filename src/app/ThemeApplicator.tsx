"use client";

import { useEffect } from "react";
import { usePreferences } from "@/lib/preferences";

export default function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { preferences } = usePreferences();

  useEffect(() => {
    const html = document.documentElement;
    if (preferences?.visualStyle) {
      html.setAttribute("data-theme", preferences.visualStyle);
    } else {
      html.removeAttribute("data-theme");
    }

    if (preferences?.darkMode) {
      html.setAttribute("data-dark", "");
    } else {
      html.removeAttribute("data-dark");
    }
  }, [preferences?.visualStyle, preferences?.darkMode]);

  return <>{children}</>;
}
