import { get, isNil } from "lodash";
import type { Section } from "@/types";
import { getAuthUserId } from "@/lib/firebase/admin";
import { readSectionsStore, writeSectionsStore } from "@/lib/db/sections";
import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";
import type { Update } from "@/types";

type Params = { params: Promise<{ sectionId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const { sectionId } = await params;
    const body = await request.json().catch(() => ({}));
    const text = (get(body, "text") as string)?.trim() ?? "";
    if (!text) return apiError("text is required", 400);
    const createdAtRaw = get(body, "createdAt");
    const createdAt =
      typeof createdAtRaw === "string" && !Number.isNaN(new Date(createdAtRaw).getTime())
        ? new Date(createdAtRaw).toISOString()
        : new Date().toISOString();
    const store = await readSectionsStore(uid);
    const section = store.sections.find((s: Section) => s.id === sectionId);
    if (isNil(section)) return apiError("Section not found", 404);
    const update: Update = {
      id: crypto.randomUUID(),
      text,
      createdAt,
    };
    section.updates = [update, ...section.updates];
    await writeSectionsStore(uid, store);
    return Response.json(update, { status: 201 });
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to create update");
  }
}
