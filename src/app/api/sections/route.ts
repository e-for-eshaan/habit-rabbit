import { get } from "lodash";

import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";
import { readSectionsStore, writeSectionsStore } from "@/lib/db/sections";
import { getAuthUserId } from "@/lib/firebase/admin";
import type { Section } from "@/types";

export async function GET(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const store = await readSectionsStore(uid);
    return Response.json(store.sections);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to load sections");
  }
}

export async function POST(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return apiError("Invalid JSON body", 400);
    }
    const title = (get(body, "title") as string)?.trim() ?? "";
    const colorKey = (get(body, "colorKey") as number) ?? 0;
    if (!title) return apiError("title is required", 400);
    const store = await readSectionsStore(uid);
    const section: Section = {
      id: crypto.randomUUID(),
      title,
      colorKey,
      updates: [],
    };
    store.sections = [...store.sections, section];
    await writeSectionsStore(uid, store);
    return Response.json(section, { status: 201 });
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to create section");
  }
}
