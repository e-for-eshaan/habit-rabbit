"use client";

import { isNil } from "lodash";
import { create } from "zustand";

import {
  createSection as createSectionApi,
  createUpdate,
  deleteUpdate as deleteUpdateApi,
  getBootstrap,
  getSectionUpdatesPage,
  updateUpdate,
} from "@/lib/api";
import { SECTION_UPDATES_PAGE_SIZE } from "@/lib/sectionUpdates";
import { parseViewSettingsFromRecord, setStoredViewSettings } from "@/lib/viewSettingsStorage";
import { useAppDataStore } from "@/store/useAppDataStore";
import type { Section, Update } from "@/types";

export type LayoutMode = "horizontal" | "grid";

export type ViewMode = "freq" | "calendar" | "list";

export type CalendarRange = "week" | "month" | "last7" | "last30";

export type FreqRange = "1m" | "3m" | "6m" | "1y";

export type SortBy = "most-all-time" | "most-today" | "recently-updated" | "name-az" | "name-za";

export type SortDir = "asc" | "desc";

export type FitnessCardioDisplay = "combined" | "split";

export type StoredViewSettings = {
  layoutMode: LayoutMode;
  viewMode: ViewMode;
  calendarRange: CalendarRange;
  freqRange: FreqRange;
  sortBy: SortBy;
  sortDir: SortDir;
  collapsedBySectionId: Record<string, boolean>;
  fitnessCardioDisplay: FitnessCardioDisplay;
};

export type PendingDelete = {
  sectionId: string;
  updateId: string;
  update: Update;
  deletedAt: number;
  timeoutId: ReturnType<typeof setTimeout>;
};

export type PendingUpdateSave = {
  sectionId: string;
  updateId: string;
};

export type PendingDeleteInFlight = {
  sectionId: string;
  updateId: string;
};

type SectionsState = {
  sections: Section[];
  loading: boolean;
  error: string | null;
  pendingUpdateSave: PendingUpdateSave | null;
  pendingDeleteInFlight: PendingDeleteInFlight | null;
  layoutMode: LayoutMode;
  viewMode: ViewMode;
  calendarRange: CalendarRange;
  freqRange: FreqRange;
  collapsedBySectionId: Record<string, boolean>;
  pendingDeletes: PendingDelete[];
  searchQuery: string;
  sortBy: SortBy;
  sortDir: SortDir;
  fitnessCardioDisplay: FitnessCardioDisplay;
  setSearchQuery: (q: string) => void;
  setSort: (sortBy: SortBy, sortDir: SortDir) => void;
  setViewMode: (mode: ViewMode) => void;
  setCalendarRange: (range: CalendarRange) => void;
  setFreqRange: (range: FreqRange) => void;
  fetchSections: () => Promise<void>;
  fetchMoreSectionUpdates: (sectionId: string) => Promise<void>;
  loadRemainingUpdatesForChartView: () => Promise<void>;
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
  setFitnessCardioDisplay: (mode: FitnessCardioDisplay) => void;
  hydrateViewSettings: (partial: Partial<StoredViewSettings>) => void;
};

function pickViewSettings(state: SectionsState): StoredViewSettings {
  return {
    layoutMode: state.layoutMode,
    viewMode: state.viewMode,
    calendarRange: state.calendarRange,
    freqRange: state.freqRange,
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    collapsedBySectionId: state.collapsedBySectionId,
    fitnessCardioDisplay: state.fitnessCardioDisplay,
  };
}

const PERSIST_DEBOUNCE_MS = 500;
let persistDebounce: ReturnType<typeof setTimeout> | null = null;

function queuePersistViewSettings(get: () => SectionsState) {
  if (persistDebounce) clearTimeout(persistDebounce);
  persistDebounce = setTimeout(() => {
    persistDebounce = null;
    void setStoredViewSettings(pickViewSettings(get()));
  }, PERSIST_DEBOUNCE_MS);
}

export const useSectionsStore = create<SectionsState>((set, get) => ({
  sections: [],
  loading: true,
  error: null,
  pendingUpdateSave: null,
  pendingDeleteInFlight: null,
  layoutMode: "horizontal",
  viewMode: "list",
  calendarRange: "last7",
  freqRange: "1m",
  collapsedBySectionId: {},
  pendingDeletes: [],
  searchQuery: "",
  sortBy: "recently-updated",
  sortDir: "desc",
  fitnessCardioDisplay: "combined",
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSort: (sortBy, sortDir) => {
    set({ sortBy, sortDir });
    queuePersistViewSettings(get);
  },
  setViewMode: (mode) => {
    set({ viewMode: mode });
    queuePersistViewSettings(get);
  },
  setCalendarRange: (range) => {
    set({ calendarRange: range });
    queuePersistViewSettings(get);
  },
  setFreqRange: (range) => {
    set({ freqRange: range });
    queuePersistViewSettings(get);
  },
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
      ...(partial.fitnessCardioDisplay !== undefined && {
        fitnessCardioDisplay: partial.fitnessCardioDisplay,
      }),
    })),

  fetchSections: async () => {
    set({ error: null });
    try {
      const { sections, viewSettings } = await getBootstrap();
      set({ sections, loading: false });
      get().hydrateViewSettings(parseViewSettingsFromRecord(viewSettings));
      useAppDataStore.getState().markSynced();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load sections",
        loading: false,
      });
    }
  },

  fetchMoreSectionUpdates: async (sectionId) => {
    const s = get().sections.find((x) => x.id === sectionId);
    if (!s) return;
    const total = s.updateCount ?? s.updates.length;
    const loaded = s.updates.length;
    if (loaded >= total) return;
    try {
      const { updates, total: t } = await getSectionUpdatesPage(
        sectionId,
        loaded,
        SECTION_UPDATES_PAGE_SIZE
      );
      set((state) => ({
        sections: state.sections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, updates: [...sec.updates, ...updates], updateCount: t }
            : sec
        ),
      }));
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load updates",
      });
    }
  },

  loadRemainingUpdatesForChartView: async () => {
    const { sections } = get();
    const needs = sections.filter((s) => (s.updateCount ?? s.updates.length) > s.updates.length);
    if (needs.length === 0) return;
    try {
      const batches = await Promise.all(
        needs.map(async (s) => {
          const total = s.updateCount ?? s.updates.length;
          const loaded = s.updates.length;
          const { updates, total: t } = await getSectionUpdatesPage(s.id, loaded, total - loaded);
          return { sectionId: s.id, updates, total: t };
        })
      );
      set((state) => ({
        sections: state.sections.map((sec) => {
          const b = batches.find((x) => x.sectionId === sec.id);
          if (!b) return sec;
          return {
            ...sec,
            updates: [...sec.updates, ...b.updates],
            updateCount: b.total,
          };
        }),
      }));
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load updates",
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
          s.id === sectionId
            ? {
                ...s,
                updates: [update, ...s.updates],
                updateCount: (s.updateCount ?? s.updates.length) + 1,
              }
            : s
        ),
      }));
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to add update",
      });
    }
  },

  editUpdate: async (sectionId, updateId, payload) => {
    const sec = get().sections.find((s) => s.id === sectionId);
    const prev = sec?.updates.find((u) => u.id === updateId);
    if (!prev) return;

    const hasText = !isNil(payload.text);
    const hasCreatedAt = !isNil(payload.createdAt);
    if (!hasText && !hasCreatedAt) return;

    const textUnchanged = !hasText || payload.text === (prev.text ?? "");
    const timeUnchanged =
      !hasCreatedAt ||
      new Date(payload.createdAt!).getTime() === new Date(prev.createdAt).getTime();
    if (textUnchanged && timeUnchanged) return;

    set({ pendingUpdateSave: { sectionId, updateId } });
    try {
      await updateUpdate(sectionId, updateId, payload);
      set((state) => ({
        pendingUpdateSave: null,
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
        pendingUpdateSave: null,
        error: e instanceof Error ? e.message : "Failed to save update",
      });
    }
  },

  scheduleDeleteUpdate: async (sectionId, updateId) => {
    const state = get();
    const section = state.sections.find((s) => s.id === sectionId);
    const update = section?.updates.find((u) => u.id === updateId);
    if (!section || !update) return;
    set({ pendingDeleteInFlight: { sectionId, updateId } });
    try {
      await deleteUpdateApi(sectionId, updateId);
    } catch (e) {
      set({
        pendingDeleteInFlight: null,
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
      pendingDeleteInFlight: null,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              updates: s.updates.filter((u) => u.id !== updateId),
              updateCount: Math.max(0, (s.updateCount ?? s.updates.length) - 1),
            }
          : s
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
          sec.id === sectionId
            ? {
                ...sec,
                updates: [restored, ...sec.updates],
                updateCount: (sec.updateCount ?? sec.updates.length) + 1,
              }
            : sec
        ),
      }));
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to restore update",
      });
    }
  },

  setLayoutMode: (mode) => {
    set({ layoutMode: mode });
    queuePersistViewSettings(get);
  },

  toggleSectionCollapse: (sectionId) => {
    set((state) => ({
      collapsedBySectionId: {
        ...state.collapsedBySectionId,
        [sectionId]: !state.collapsedBySectionId[sectionId],
      },
    }));
    queuePersistViewSettings(get);
  },

  collapseAll: () => {
    set((state) => ({
      collapsedBySectionId: Object.fromEntries(state.sections.map((s) => [s.id, true])),
    }));
    queuePersistViewSettings(get);
  },

  expandAll: () => {
    set((state) => ({
      collapsedBySectionId: Object.fromEntries(state.sections.map((s) => [s.id, false])),
    }));
    queuePersistViewSettings(get);
  },

  setFitnessCardioDisplay: (mode) => {
    set({ fitnessCardioDisplay: mode });
    queuePersistViewSettings(get);
  },
}));

export const selectIsGridCollapsed = (state: SectionsState): boolean =>
  state.sections.length > 0 && state.sections.every((s) => state.collapsedBySectionId[s.id]);
