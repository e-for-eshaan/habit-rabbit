"use client";

import { useEffect, useRef } from "react";
import { useSectionsStore, subscribeViewSettingsPersist } from "@/store/useSectionsStore";
import { getStoredViewSettings, setStoredViewSettings } from "@/lib/viewSettingsStorage";
import type { StoredViewSettings } from "@/lib/viewSettingsStorage";

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
