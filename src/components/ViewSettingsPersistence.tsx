"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { getStoredViewSettings } from "@/lib/viewSettingsStorage";
import { useSectionsStore } from "@/store/useSectionsStore";

export function ViewSettingsPersistence() {
  const pathname = usePathname();
  const hydrated = useRef(false);
  const hydrateViewSettings = useSectionsStore((s) => s.hydrateViewSettings);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (pathname === "/") return;
    getStoredViewSettings().then((stored) => {
      if (stored) hydrateViewSettings(stored);
    });
  }, [pathname, hydrateViewSettings]);

  return null;
}
