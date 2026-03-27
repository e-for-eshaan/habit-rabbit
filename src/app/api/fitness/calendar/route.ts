import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";
import { readFitnessStore } from "@/lib/db/fitness";
import { getAuthUserId } from "@/lib/firebase/admin";
import { buildFitnessCalendarMonthResponse } from "@/lib/fitnessCalendarMonth";

function parseMonthParams(searchParams: URLSearchParams): { year: number; month: number } | null {
  const y = searchParams.get("year");
  const m = searchParams.get("month");
  if (!y || !m) return null;
  const year = Number.parseInt(y, 10);
  const month = Number.parseInt(m, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (year < 1970 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export async function GET(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const url = new URL(request.url);
    const parsed = parseMonthParams(url.searchParams);
    if (!parsed) {
      return apiError("Query params year and month (1-12) are required", 400);
    }
    const state = await readFitnessStore(uid);
    const payload = buildFitnessCalendarMonthResponse(
      parsed.year,
      parsed.month,
      state.dayLogs,
      state.exercises
    );
    return Response.json(payload);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to load fitness calendar month");
  }
}
