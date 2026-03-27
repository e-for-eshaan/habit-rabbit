"use client";

import { useEffect, useRef } from "react";

import type { StoredViewSettings } from "@/lib/viewSettingsStorage";
import { getStoredViewSettings, setStoredViewSettings } from "@/lib/viewSettingsStorage";
import { subscribeViewSettingsPersist, useSectionsStore } from "@/store/useSectionsStore";

const PERSIST_DEBOUNCE_MS = 500;

export function ViewSettingsPersistence() {
  const hydrated = useRef(false);
  const hydrateViewSettings = useSectionsStore((s) => s.hydrateViewSettings);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    getStoredViewSettings().then((stored) => {
      if (stored) hydrateViewSettings(stored);
    });
  }, [hydrateViewSettings]);

  useEffect(() => {
    const unsub = subscribeViewSettingsPersist((settings: StoredViewSettings) => {
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
      persistTimeoutRef.current = setTimeout(() => {
        persistTimeoutRef.current = null;
        setStoredViewSettings(settings);
      }, PERSIST_DEBOUNCE_MS);
    });
    return () => {
      unsub();
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    };
  }, []);

  return null;
}
