import { NextResponse } from "next/server";
import { readFitnessStore } from "@/lib/fitnessStore";
import { computeFitnessDashboard } from "@/lib/fitnessDashboard";

export async function GET() {
  try {
    const state = await readFitnessStore();
    const data = computeFitnessDashboard(state);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
