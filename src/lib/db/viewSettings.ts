import { getFirestore } from "firebase-admin/firestore";

import { adminApp } from "@/lib/firebase/admin";

const DOC_ID = "viewSettings";

export async function readViewSettings(uid: string): Promise<Record<string, unknown>> {
  if (!adminApp) return {};
  const db = getFirestore(adminApp);
  const ref = db.collection("users").doc(uid).collection("data").doc(DOC_ID);
  const snap = await ref.get();
  if (!snap.exists) return {};
  return (snap.data() as Record<string, unknown>) ?? {};
}

export async function writeViewSettings(uid: string, data: Record<string, unknown>): Promise<void> {
  if (!adminApp) return;
  const db = getFirestore(adminApp);
  const ref = db.collection("users").doc(uid).collection("data").doc(DOC_ID);
  await ref.set(data);
}
