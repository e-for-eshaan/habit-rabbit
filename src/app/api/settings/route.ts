import { getAuthUserId } from "@/lib/firebase/admin";
import { readViewSettings, writeViewSettings } from "@/lib/db/viewSettings";
import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";

export async function GET(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const data = await readViewSettings(uid);
    return Response.json(data);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to load settings");
  }
}

export async function PATCH(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return apiError("Invalid JSON body", 400);
    }
    await writeViewSettings(uid, body as Record<string, unknown>);
    return Response.json(body);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to save settings");
  }
}
