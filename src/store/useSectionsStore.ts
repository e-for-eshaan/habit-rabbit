"use client";

import { create } from "zustand";

import {
  createSection as createSectionApi,
  createUpdate,
  deleteUpdate as deleteUpdateApi,
  getSections as fetchSectionsApi,
  updateUpdate,
} from "@/lib/api";
import type { Section, Update } from "@/types";

export type LayoutMode = "horizontal" | "grid";

export type ViewMode = "freq" | "calendar" | "list";

export type CalendarRange = "week" | "month" | "last7" | "last30";

export type FreqRange = "1m" | "3m" | "6m" | "1y";

export type SortBy = "most-all-time" | "most-today" | "recently-updated" | "name-az" | "name-za";

export type SortDir = "asc" | "desc";

export type StoredViewSettings = {
  layoutMode: LayoutMode;
  viewMode: ViewMode;
  calendarRange: CalendarRange;
  freqRange: FreqRange;
  sortBy: SortBy;
  sortDir: SortDir;
  collapsedBySectionId: Record<string, boolean>;
};

export type PendingDelete = {
  sectionId: string;
  updateId: string;
  update: Update;
  deletedAt: number;
  timeoutId: ReturnType<typeof setTimeout>;
};

type SectionsState = {
  sections: Section[];
  loading: boolean;
  error: string | null;
  layoutMode: LayoutMode;
  viewMode: ViewMode;
  calendarRange: CalendarRange;
  freqRange: FreqRange;
  collapsedBySectionId: Record<string, boolean>;
  pendingDeletes: PendingDelete[];
  searchQuery: string;
  sortBy: SortBy;
  sortDir: SortDir;
  setSearchQuery: (q: string) => void;
  setSort: (sortBy: SortBy, sortDir: SortDir) => void;
  setViewMode: (mode: ViewMode) => void;
  setCalendarRange: (range: CalendarRange) => void;
  setFreqRange: (range: FreqRange) => void;
  fetchSections: () => Promise<void>;
  addSection: (title: string) => Promise<void>;
  addUpdate: (sectionId: string, text: string) => Promise<void>;
  editUpdate: (
    sectionId: string,
    updateId: string,
    payload: { text?: string; createdAt?: string }
  ) => Promise<void>;
  scheduleDeleteUpdate: (sectionId: string, updateId: string) => Promise<void>;
  cancelDelete: (sectionId: string, updateId: string) => Promise<void>;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleSectionCollapse: (sectionId: string) => void;
  collapseAll: () => void;
  expandAll: () => void;
  hydrateViewSettings: (partial: Partial<StoredViewSettings>) => void;
};

export const useSectionsStore = create<SectionsState>((set, get) => ({
  sections: [],
  loading: true,
  error: null,
  layoutMode: "horizontal",
  viewMode: "list",
  calendarRange: "last7",
  freqRange: "1m",
  collapsedBySectionId: {},
  pendingDeletes: [],
  searchQuery: "",
  sortBy: "recently-updated",
  sortDir: "desc",
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSort: (sortBy, sortDir) => set({ sortBy, sortDir }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setCalendarRange: (range) => set({ calendarRange: range }),
  setFreqRange: (range) => set({ freqRange: range }),
  hydrateViewSettings: (partial) =>
    set((state) => ({
      ...state,
      ...(partial.layoutMode !== undefined && { layoutMode: partial.layoutMode }),
      ...(partial.viewMode !== undefined && { viewMode: partial.viewMode }),
      ...(partial.calendarRange !== undefined && { calendarRange: partial.calendarRange }),
      ...(partial.freqRange !== undefined && { freqRange: partial.freqRange }),
      ...(partial.sortBy !== undefined && { sortBy: partial.sortBy }),
      ...(partial.sortDir !== undefined && { sortDir: partial.sortDir }),
      ...(partial.collapsedBySectionId !== undefined && {
        collapsedBySectionId: partial.collapsedBySectionId,
      }),
    })),

  fetchSections: async () => {
    set({ error: null });
    try {
      const data = await fetchSectionsApi();
      set({ sections: data, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load sections",
        loading: false,
      });
    }
  },

  addSection: async (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const section = await createSectionApi({
        title: trimmed,
        colorKey: get().sections.length % 6,
      });
      set((state) => ({ sections: [...state.sections, section] }));
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to create habit",
      });
    }
  },

  addUpdate: async (sectionId, text) => {
    try {
      const update = await createUpdate(sectionId, { text });
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? { ...s, updates: [update, ...s.updates] } : s
        ),
      }));
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to add update",
      });
    }
  },

  editUpdate: async (sectionId, updateId, payload) => {
    try {
      await updateUpdate(sectionId, updateId, payload);
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                updates: s.updates.map((u) => (u.id === updateId ? { ...u, ...payload } : u)),
              }
            : s
        ),
      }));
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to save update",
      });
    }
  },

  scheduleDeleteUpdate: async (sectionId, updateId) => {
    const state = get();
    const section = state.sections.find((s) => s.id === sectionId);
    const update = section?.updates.find((u) => u.id === updateId);
    if (!section || !update) return;
    try {
      await deleteUpdateApi(sectionId, updateId);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to delete update",
      });
      return;
    }
    const deletedAt = Date.now();
    const timeoutId = setTimeout(() => {
      set((prev) => ({
        pendingDeletes: prev.pendingDeletes.filter(
          (p) => p.sectionId !== sectionId || p.updateId !== updateId
        ),
      }));
    }, 10000);
    set((prev) => ({
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, updates: s.updates.filter((u) => u.id !== updateId) } : s
      ),
      pendingDeletes: [
        ...prev.pendingDeletes,
        { sectionId, updateId, update, deletedAt, timeoutId },
      ],
    }));
  },

  cancelDelete: async (sectionId, updateId) => {
    const state = get();
    const pending = state.pendingDeletes.find(
      (p) => p.sectionId === sectionId && p.updateId === updateId
    );
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    set((prev) => ({
      pendingDeletes: prev.pendingDeletes.filter(
        (p) => p.sectionId !== sectionId || p.updateId !== updateId
      ),
    }));
    try {
      const restored = await createUpdate(sectionId, {
        text: pending.update.text,
        createdAt: pending.update.createdAt,
      });
      set((s) => ({
        sections: s.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, updates: [restored, ...sec.updates] } : sec
        ),
      }));
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to restore update",
      });
    }
  },

  setLayoutMode: (mode) => set({ layoutMode: mode }),

  toggleSectionCollapse: (sectionId) =>
    set((state) => ({
      collapsedBySectionId: {
        ...state.collapsedBySectionId,
        [sectionId]: !state.collapsedBySectionId[sectionId],
      },
    })),

  collapseAll: () =>
    set((state) => ({
      collapsedBySectionId: Object.fromEntries(state.sections.map((s) => [s.id, true])),
    })),

  expandAll: () =>
    set((state) => ({
      collapsedBySectionId: Object.fromEntries(state.sections.map((s) => [s.id, false])),
    })),
}));

function pickViewSettings(state: SectionsState): StoredViewSettings {
  return {
    layoutMode: state.layoutMode,
    viewMode: state.viewMode,
    calendarRange: state.calendarRange,
    freqRange: state.freqRange,
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    collapsedBySectionId: state.collapsedBySectionId,
  };
}

export function subscribeViewSettingsPersist(
  persist: (settings: StoredViewSettings) => void
): () => void {
  return useSectionsStore.subscribe((state) => persist(pickViewSettings(state)));
}

export const selectIsGridCollapsed = (state: SectionsState): boolean =>
  state.sections.length > 0 && state.sections.every((s) => state.collapsedBySectionId[s.id]);
