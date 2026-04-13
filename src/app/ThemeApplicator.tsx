"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/lib/preferences";

export default function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const html = document.documentElement;

    function applyTheme() {
      if (settings.visualStyle && settings.visualStyle !== "focused") {
        html.setAttribute("data-theme", settings.visualStyle);
      } else {
        html.removeAttribute("data-theme");
      }

      if (settings.darkMode) {
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
  }, [settings.visualStyle, settings.darkMode]);

  return <>{children}</>;
}
