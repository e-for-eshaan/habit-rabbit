"use client";

import { create } from "zustand";

import { getFitnessDashboard } from "@/lib/api";
import type { FitnessDashboardData } from "@/types/fitnessDashboard";

type FitnessDashboardState = {
  data: FitnessDashboardData | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
  setData: (data: FitnessDashboardData | null) => void;
  invalidate: () => void;
};

export const useFitnessDashboardStore = create<FitnessDashboardState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ error: null, loading: true });
    try {
      const data = await getFitnessDashboard();
      set({ data, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load dashboard",
        loading: false,
      });
    }
  },

  setData: (data) => set({ data }),

  invalidate: () => set({ data: null }),
}));
