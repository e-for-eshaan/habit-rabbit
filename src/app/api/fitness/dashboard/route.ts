import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";
import { readFitnessStore } from "@/lib/db/fitness";
import { getAuthUserId } from "@/lib/firebase/admin";
import { computeFitnessDashboard } from "@/lib/fitnessDashboard";

export async function GET(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const state = await readFitnessStore(uid);
    const data = computeFitnessDashboard(state);
    return Response.json(data);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to load dashboard");
  }
}
