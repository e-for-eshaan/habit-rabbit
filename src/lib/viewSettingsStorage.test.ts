import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateViewSettings } from "@/lib/api";

import {
  mergePartialWithDefaults,
  parseViewSettingsFromRecord,
  syncViewSettingsWithRemote,
  VIEW_SETTINGS_DEFAULTS,
} from "./viewSettingsStorage";

vi.mock("@/lib/api", () => ({
  updateViewSettings: vi.fn().mockResolvedValue(undefined),
}));

describe("mergePartialWithDefaults", () => {
  it("fills missing fields from defaults", () => {
    expect(mergePartialWithDefaults({ layoutMode: "grid" })).toEqual({
      ...VIEW_SETTINGS_DEFAULTS,
      layoutMode: "grid",
    });
  });
});

describe("parseViewSettingsFromRecord", () => {
  it("ignores updatedAt for view fields", () => {
    const partial = parseViewSettingsFromRecord({
      updatedAt: 99,
      layoutMode: "grid",
    });
    expect(partial.layoutMode).toBe("grid");
    expect(partial).not.toHaveProperty("updatedAt");
  });
});

describe("syncViewSettingsWithRemote", () => {
  const uid = "test-uid";

  beforeEach(() => {
    vi.mocked(updateViewSettings).mockClear();
    localStorage.clear();
  });

  it("returns null when remote and local are empty", async () => {
    const result = await syncViewSettingsWithRemote({}, uid);
    expect(result).toBeNull();
    expect(updateViewSettings).not.toHaveBeenCalled();
  });

  it("pushes local to backend when local is newer", async () => {
    const bundle = {
      settings: { ...VIEW_SETTINGS_DEFAULTS, layoutMode: "grid" as const },
      updatedAt: 5000,
    };
    localStorage.setItem(`habit-rabbit:viewSettings:${uid}`, JSON.stringify(bundle));

    const result = await syncViewSettingsWithRemote({ updatedAt: 100 }, uid);

    expect(updateViewSettings).toHaveBeenCalledWith({
      ...bundle.settings,
      updatedAt: 5000,
    });
    expect(result?.layoutMode).toBe("grid");
  });

  it("applies remote when remote is newer", async () => {
    localStorage.setItem(
      `habit-rabbit:viewSettings:${uid}`,
      JSON.stringify({
        settings: VIEW_SETTINGS_DEFAULTS,
        updatedAt: 100,
      })
    );

    const result = await syncViewSettingsWithRemote({ layoutMode: "grid", updatedAt: 9000 }, uid);

    expect(updateViewSettings).not.toHaveBeenCalled();
    expect(result?.layoutMode).toBe("grid");
    const stored = localStorage.getItem(`habit-rabbit:viewSettings:${uid}`);
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).updatedAt).toBe(9000);
  });

  it("treats legacy remote without updatedAt as 0 so local wins", async () => {
    localStorage.setItem(
      `habit-rabbit:viewSettings:${uid}`,
      JSON.stringify({
        settings: { ...VIEW_SETTINGS_DEFAULTS, viewMode: "calendar" as const },
        updatedAt: 1,
      })
    );

    await syncViewSettingsWithRemote({ layoutMode: "horizontal" }, uid);

    expect(updateViewSettings).toHaveBeenCalled();
  });
});
