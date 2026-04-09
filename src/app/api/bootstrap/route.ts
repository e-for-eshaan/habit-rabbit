import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";
import { readHomeBootstrap } from "@/lib/db/bootstrap";
import { getAuthUserId } from "@/lib/firebase/admin";
import {
  SECTION_UPDATES_PAGE_SIZE,
  sliceUpdatesPage,
  sortUpdatesNewestFirst,
} from "@/lib/sectionUpdates";
import type { Section } from "@/types";

function sectionForBootstrapClient(s: Section): Section {
  const sorted = sortUpdatesNewestFirst(s.updates);
  const total = sorted.length;
  return {
    ...s,
    updates: sliceUpdatesPage(sorted, 0, SECTION_UPDATES_PAGE_SIZE),
    updateCount: total,
  };
}

export async function GET(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const { store, viewSettings } = await readHomeBootstrap(uid);
    return Response.json({
      sections: store.sections.map(sectionForBootstrapClient),
      viewSettings,
    });
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to load bootstrap data");
  }
}
