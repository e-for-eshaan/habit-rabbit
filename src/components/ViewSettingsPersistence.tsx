"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { getViewSettings } from "@/lib/api";
import { syncViewSettingsWithRemote } from "@/lib/viewSettingsStorage";
import { useSectionsStore } from "@/store/useSectionsStore";

export function ViewSettingsPersistence() {
  const pathname = usePathname();
  const { user } = useAuth();
  const hydrated = useRef(false);
  const hydrateViewSettings = useSectionsStore((s) => s.hydrateViewSettings);

  useEffect(() => {
    if (pathname === "/") return;
    if (!user?.uid) return;
    if (hydrated.current) return;
    hydrated.current = true;
    void getViewSettings()
      .then((remote) => syncViewSettingsWithRemote(remote, user.uid))
      .then((stored) => {
        if (stored) hydrateViewSettings(stored);
      });
  }, [pathname, user?.uid, hydrateViewSettings]);

  return null;
}
