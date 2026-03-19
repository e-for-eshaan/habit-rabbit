import { get, isNil } from "lodash";
import type { Section, Update } from "@/types";
import { getAuthUserId } from "@/lib/firebase/admin";
import { readSectionsStore, writeSectionsStore } from "@/lib/db/sections";
import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";

type Params = { params: Promise<{ sectionId: string; updateId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const { sectionId, updateId } = await params;
    const body = await request.json().catch(() => ({}));
    const store = await readSectionsStore(uid);
    const section = store.sections.find((s: Section) => s.id === sectionId);
    if (isNil(section)) return apiError("Section not found", 404);
    const update = section.updates.find((u: Update) => u.id === updateId);
    if (isNil(update)) return apiError("Update not found", 404);
    const text = get(body, "text");
    if (typeof text === "string") update.text = text.trim();
    const createdAt = get(body, "createdAt");
    if (typeof createdAt === "string") {
      const d = new Date(createdAt);
      if (!Number.isNaN(d.getTime())) update.createdAt = d.toISOString();
    }
    await writeSectionsStore(uid, store);
    return Response.json(update);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to update update");
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const { sectionId, updateId } = await params;
    const store = await readSectionsStore(uid);
    const section = store.sections.find((s: Section) => s.id === sectionId);
    if (isNil(section)) return apiError("Section not found", 404);
    const index = section.updates.findIndex((u: Update) => u.id === updateId);
    if (index === -1) return apiError("Update not found", 404);
    section.updates = [...section.updates.slice(0, index), ...section.updates.slice(index + 1)];
    await writeSectionsStore(uid, store);
    return Response.json({ ok: true });
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to delete update");
  }
}
