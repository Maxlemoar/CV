"use client";

import { useEffect, useRef } from "react";
import { usePreferences } from "@/lib/preferences";

export default function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { preferences } = usePreferences();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const html = document.documentElement;

    function applyTheme() {
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
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      applyTheme();
      return;
    }

    if (document.startViewTransition) {
      document.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }, [preferences?.visualStyle, preferences?.darkMode]);

  return <>{children}</>;
}
