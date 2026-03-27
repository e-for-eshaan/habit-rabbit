import { get } from "lodash";

import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";
import { readSectionsStore, writeSectionsStore } from "@/lib/db/sections";
import { getAuthUserId } from "@/lib/firebase/admin";
import type { Section } from "@/types";

type Params = { params: Promise<{ sectionId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const { sectionId } = await params;
    const body = await request.json().catch(() => ({}));
    const store = await readSectionsStore(uid);
    const index = store.sections.findIndex((s: Section) => s.id === sectionId);
    if (index === -1) return apiError("Section not found", 404);
    const section = store.sections[index]!;
    const title = get(body, "title");
    if (typeof title === "string" && title.trim()) section.title = title.trim();
    const colorKey = get(body, "colorKey");
    if (typeof colorKey === "number") section.colorKey = colorKey;
    await writeSectionsStore(uid, store);
    return Response.json(section);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to update section");
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const { sectionId } = await params;
    const store = await readSectionsStore(uid);
    const index = store.sections.findIndex((s: Section) => s.id === sectionId);
    if (index === -1) return apiError("Section not found", 404);
    store.sections = [...store.sections.slice(0, index), ...store.sections.slice(index + 1)];
    await writeSectionsStore(uid, store);
    return Response.json({ ok: true });
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to delete section");
  }
}
