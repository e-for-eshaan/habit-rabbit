/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Store } from "@/lib/store";
import type { Section, Update } from "@/types";
import type { FitnessState } from "@/types/fitness";

const mockSections: Section[] = [
  { id: "sec-1", title: "Fitness", colorKey: 0, updates: [] },
  {
    id: "sec-2",
    title: "Music",
    colorKey: 1,
    updates: [
      { id: "up-1", text: "Update one", createdAt: "2025-01-01T12:00:00.000Z" },
    ] as Update[],
  },
];

const mockStore: Store = { sections: [...mockSections] };

const mockFitnessState: FitnessState = {
  exercises: [{ id: "ex-1", label: "Squat", group: "Legs" }],
  dayLogs: [
    {
      dateKey: "2025-03-01",
      exerciseIds: ["ex-1"],
      swimmingSessions: 0,
      runningSessions: 0,
    },
  ],
};

vi.mock("@/lib/firebase/admin", () => ({
  getAuthUserId: vi.fn().mockResolvedValue("test-uid"),
}));

vi.mock("@/lib/db/sections", () => ({
  readSectionsStore: vi.fn(),
  writeSectionsStore: vi.fn(),
}));

vi.mock("@/lib/db/fitness", () => ({
  readFitnessStore: vi.fn(),
  writeFitnessStore: vi.fn(),
}));

function authRequest(url: string, init?: RequestInit): Request {
  return new Request(url, {
    ...init,
    headers: {
      Authorization: "Bearer test-token",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

async function getSectionsResponse() {
  const { GET } = await import("@/app/api/sections/route");
  return GET(authRequest("http://localhost/api/sections"));
}

async function postSectionResponse(body: { title: string; colorKey?: number }) {
  const { POST } = await import("@/app/api/sections/route");
  return POST(
    authRequest("http://localhost/api/sections", { method: "POST", body: JSON.stringify(body) })
  );
}

async function patchSectionResponse(
  sectionId: string,
  body: { title?: string; colorKey?: number }
) {
  const { PATCH } = await import("@/app/api/sections/[sectionId]/route");
  return PATCH(
    authRequest(`http://localhost/api/sections/${sectionId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ sectionId }) }
  );
}

async function deleteSectionResponse(sectionId: string) {
  const { DELETE } = await import("@/app/api/sections/[sectionId]/route");
  return DELETE(authRequest(`http://localhost/api/sections/${sectionId}`, { method: "DELETE" }), {
    params: Promise.resolve({ sectionId }),
  });
}

async function postUpdateResponse(sectionId: string, body: { text: string; createdAt?: string }) {
  const { POST } = await import("@/app/api/sections/[sectionId]/updates/route");
  return POST(
    authRequest(`http://localhost/api/sections/${sectionId}/updates`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ sectionId }) }
  );
}

async function patchUpdateResponse(
  sectionId: string,
  updateId: string,
  body: { text?: string; createdAt?: string }
) {
  const { PATCH } = await import("@/app/api/sections/[sectionId]/updates/[updateId]/route");
  return PATCH(
    authRequest(`http://localhost/api/sections/${sectionId}/updates/${updateId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ sectionId, updateId }) }
  );
}

async function deleteUpdateResponse(sectionId: string, updateId: string) {
  const { DELETE } = await import("@/app/api/sections/[sectionId]/updates/[updateId]/route");
  return DELETE(
    authRequest(`http://localhost/api/sections/${sectionId}/updates/${updateId}`, {
      method: "DELETE",
    }),
    { params: Promise.resolve({ sectionId, updateId }) }
  );
}

async function getFitnessResponse() {
  const { GET } = await import("@/app/api/fitness/route");
  return GET(authRequest("http://localhost/api/fitness"));
}

async function patchFitnessResponse(payload: FitnessState) {
  const { PATCH } = await import("@/app/api/fitness/route");
  return PATCH(
    authRequest("http://localhost/api/fitness", {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  );
}

async function getFitnessDashboardResponse() {
  const { GET } = await import("@/app/api/fitness/dashboard/route");
  return GET(authRequest("http://localhost/api/fitness/dashboard"));
}

describe("API sections", () => {
  beforeEach(async () => {
    vi.resetModules();
    const db = await import("@/lib/db/sections");
    vi.mocked(db.readSectionsStore).mockResolvedValue(mockStore);
    vi.mocked(db.writeSectionsStore).mockResolvedValue(undefined);
  });

  describe("GET /api/sections", () => {
    it("returns sections from store", async () => {
      const res = await getSectionsResponse();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(mockSections.length);
      expect(data[0]).toMatchObject({ id: "sec-1", title: "Fitness", colorKey: 0 });
    });
  });

  describe("POST /api/sections", () => {
    it("returns 400 when title is missing", async () => {
      const res = await postSectionResponse({ title: "" });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("title is required");
    });

    it("creates section and returns 201", async () => {
      const res = await postSectionResponse({ title: "New habit", colorKey: 2 });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe("New habit");
      expect(data.colorKey).toBe(2);
      expect(data.id).toBeDefined();
      expect(Array.isArray(data.updates)).toBe(true);
    });
  });

  describe("PATCH /api/sections/[sectionId]", () => {
    it("returns 404 when section not found", async () => {
      const res = await patchSectionResponse("nonexistent", { title: "Foo" });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Section not found");
    });

    it("updates section title and colorKey", async () => {
      const res = await patchSectionResponse("sec-1", {
        title: "Updated title",
        colorKey: 3,
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe("Updated title");
      expect(data.colorKey).toBe(3);
    });
  });

  describe("DELETE /api/sections/[sectionId]", () => {
    it("returns 404 when section not found", async () => {
      const res = await deleteSectionResponse("nonexistent");
      expect(res.status).toBe(404);
    });

    it("returns ok when section deleted", async () => {
      const res = await deleteSectionResponse("sec-1");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });
  });

  describe("POST /api/sections/[sectionId]/updates", () => {
    it("returns 400 when text is missing", async () => {
      const res = await postUpdateResponse("sec-1", { text: "" });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("text is required");
    });

    it("returns 404 when section not found", async () => {
      const res = await postUpdateResponse("nonexistent", { text: "Hello" });
      expect(res.status).toBe(404);
    });

    it("creates update and returns 201", async () => {
      const res = await postUpdateResponse("sec-2", { text: "New update" });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.text).toBe("New update");
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
    });
  });

  describe("PATCH /api/sections/[sectionId]/updates/[updateId]", () => {
    it("returns 404 when section not found", async () => {
      const res = await patchUpdateResponse("nonexistent", "up-1", { text: "Hi" });
      expect(res.status).toBe(404);
    });

    it("returns 404 when update not found", async () => {
      const res = await patchUpdateResponse("sec-2", "nonexistent", { text: "Hi" });
      expect(res.status).toBe(404);
    });

    it("updates update text", async () => {
      const res = await patchUpdateResponse("sec-2", "up-1", { text: "Updated text" });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.text).toBe("Updated text");
    });
  });

  describe("DELETE /api/sections/[sectionId]/updates/[updateId]", () => {
    it("returns 404 when section not found", async () => {
      const res = await deleteUpdateResponse("nonexistent", "up-1");
      expect(res.status).toBe(404);
    });

    it("returns ok when update deleted", async () => {
      const res = await deleteUpdateResponse("sec-2", "up-1");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });
  });
});

describe("API fitness", () => {
  beforeEach(async () => {
    vi.resetModules();
    const db = await import("@/lib/db/fitness");
    vi.mocked(db.readFitnessStore).mockResolvedValue(mockFitnessState);
    vi.mocked(db.writeFitnessStore).mockResolvedValue(undefined);
  });

  describe("GET /api/fitness", () => {
    it("returns fitness state from store", async () => {
      const res = await getFitnessResponse();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.exercises).toBeDefined();
      expect(data.dayLogs).toBeDefined();
      expect(Array.isArray(data.exercises)).toBe(true);
      expect(Array.isArray(data.dayLogs)).toBe(true);
    });
  });

  describe("PATCH /api/fitness", () => {
    it("returns 400 for invalid state", async () => {
      const res = await patchFitnessResponse({
        exercises: [],
        dayLogs: "not-array",
      } as unknown as FitnessState);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid fitness state");
    });

    it("saves valid state and returns it", async () => {
      const res = await patchFitnessResponse(mockFitnessState);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.exercises).toHaveLength(mockFitnessState.exercises.length);
      expect(data.dayLogs).toHaveLength(mockFitnessState.dayLogs.length);
    });
  });

  describe("GET /api/fitness/dashboard", () => {
    it("returns dashboard data", async () => {
      const res = await getFitnessDashboardResponse();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toBeDefined();
      expect(typeof data).toBe("object");
    });
  });
});
