import { isNil } from "lodash";

import { apiError, apiErrorFromUnknown } from "@/lib/apiResponse";
import { readFitnessStore, writeFitnessStore } from "@/lib/db/fitness";
import { getAuthUserId } from "@/lib/firebase/admin";
import { isValidOptionalNfStreakStartedAt } from "@/lib/fitnessStore";
import type { DayLog, FitnessState } from "@/types/fitness";

function isValidDateKey(s: unknown): boolean {
  if (typeof s !== "string") return false;
  const d = new Date(s + "T12:00:00");
  return !Number.isNaN(d.getTime());
}

function validateDayLog(log: unknown): log is DayLog {
  if (isNil(log) || typeof log !== "object") return false;
  const l = log as Record<string, unknown>;
  const hasSelectedGroups =
    l.selectedGroups === undefined ||
    (Array.isArray(l.selectedGroups) &&
      l.selectedGroups.every((g: unknown) => typeof g === "string"));
  const hasNf = l.nfCompleted === undefined || typeof l.nfCompleted === "boolean";
  return (
    isValidDateKey(l.dateKey) &&
    Array.isArray(l.exerciseIds) &&
    l.exerciseIds.every((id) => typeof id === "string") &&
    typeof l.swimmingSessions === "number" &&
    typeof l.runningSessions === "number" &&
    hasSelectedGroups &&
    hasNf
  );
}

function validateState(body: unknown): body is FitnessState {
  if (isNil(body) || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  if (!isValidOptionalNfStreakStartedAt(o.nfStreakStartedAt)) return false;
  if (!Array.isArray(o.exercises) || !Array.isArray(o.dayLogs)) return false;
  for (const ex of o.exercises as unknown[]) {
    const e = ex as Record<string, unknown>;
    if (
      isNil(ex) ||
      typeof e.id !== "string" ||
      typeof e.label !== "string" ||
      typeof e.group !== "string"
    )
      return false;
  }
  return (o.dayLogs as unknown[]).every(validateDayLog);
}

export async function GET(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const state = await readFitnessStore(uid);
    return Response.json(state);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to load fitness data");
  }
}

export async function PATCH(request: Request) {
  try {
    const uid = await getAuthUserId(request);
    if (!uid) return apiError("Unauthorized", 401);
    const body = await request.json().catch(() => null);
    if (!validateState(body)) {
      return apiError(
        "Invalid fitness state: exercises and dayLogs required with valid shape",
        400
      );
    }
    await writeFitnessStore(uid, body);
    return Response.json(body);
  } catch (e) {
    return apiErrorFromUnknown(e, "Failed to save fitness data");
  }
}
