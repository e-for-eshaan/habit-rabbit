import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";
import type { FitnessState } from "@/types/fitness";
import {
  hasValidFitnessState,
  migrateWeekLogsToDayLogs,
  getDefaultFitnessState,
} from "@/lib/fitnessStore";

export async function readFitnessStore(uid: string): Promise<FitnessState> {
  if (!adminApp) return getDefaultFitnessState();
  const db = getFirestore(adminApp);
  const ref = db.collection("users").doc(uid).collection("data").doc("fitness");
  const snap = await ref.get();
  if (!snap.exists) return getDefaultFitnessState();
  const data = snap.data() as Record<string, unknown>;
  if (!hasValidFitnessState(data)) return getDefaultFitnessState();
  if (Array.isArray(data.dayLogs)) return data as FitnessState;
  return migrateWeekLogsToDayLogs(data);
}

export async function writeFitnessStore(uid: string, state: FitnessState): Promise<void> {
  if (!adminApp) return;
  const db = getFirestore(adminApp);
  const ref = db.collection("users").doc(uid).collection("data").doc("fitness");
  await ref.set(state);
}
