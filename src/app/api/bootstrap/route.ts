import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";
import { readHomeBootstrap } from "@/lib/db/bootstrap";
import { getAuthUserId } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const { store, viewSettings } = await readHomeBootstrap(uid);
    return Response.json({ sections: store.sections, viewSettings });
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to load bootstrap data");
  }
}
