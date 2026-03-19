import { NextResponse } from "next/server";
import { isNil } from "lodash";
import { readFitnessStore, writeFitnessStore } from "@/lib/fitnessStore";
import type { FitnessState, WeekLog } from "@/types/fitness";

function isValidWeekStart(s: unknown): boolean {
  if (typeof s !== "string") return false;
  const d = new Date(s + "T12:00:00");
  return !Number.isNaN(d.getTime()) && d.getDay() === 1;
}

function validateWeekLog(log: unknown): log is WeekLog {
  if (isNil(log) || typeof log !== "object") return false;
  const l = log as Record<string, unknown>;
  return (
    isValidWeekStart(l.weekStart) &&
    Array.isArray(l.exerciseIds) &&
    l.exerciseIds.every((id) => typeof id === "string") &&
    typeof l.swimmingSessions === "number" &&
    typeof l.runningSessions === "number"
  );
}

function validateState(body: unknown): body is FitnessState {
  if (isNil(body) || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  if (!Array.isArray(o.exercises) || !Array.isArray(o.weekLogs)) return false;
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
  return (o.weekLogs as unknown[]).every(validateWeekLog);
}

export async function GET() {
  try {
    const state = await readFitnessStore();
    return NextResponse.json(state);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load fitness data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (!validateState(body)) {
    return NextResponse.json(
      { error: "Invalid fitness state: exercises and weekLogs required with valid shape" },
      { status: 400 }
    );
  }
  try {
    await writeFitnessStore(body);
    return NextResponse.json(body);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save fitness data" },
      { status: 500 }
    );
  }
}
