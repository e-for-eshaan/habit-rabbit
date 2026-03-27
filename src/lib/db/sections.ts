import { getFirestore } from "firebase-admin/firestore";
import { isNil } from "lodash";

import { adminApp } from "@/lib/firebase/admin";
import type { Store } from "@/lib/store";
import type { Section } from "@/types";

const DEFAULT_SECTIONS: Section[] = [
  { id: "fitness", title: "Fitness", colorKey: 0, updates: [] },
  { id: "music", title: "Music", colorKey: 1, updates: [] },
  { id: "the-video-project", title: "The video project", colorKey: 2, updates: [] },
  { id: "reading", title: "Reading", colorKey: 3, updates: [] },
  { id: "Development", title: "Development", colorKey: 4, updates: [] },
  { id: "relationship", title: "Relationship", colorKey: 5, updates: [] },
];

function hasValidSections(data: unknown): data is Store {
  return !isNil(data) && Array.isArray((data as Store).sections);
}

function getDefaultStore(): Store {
  return { sections: [...DEFAULT_SECTIONS] };
}

export async function readSectionsStore(uid: string): Promise<Store> {
  if (!adminApp) return getDefaultStore();
  const db = getFirestore(adminApp);
  const ref = db.collection("users").doc(uid).collection("data").doc("sections");
  const snap = await ref.get();
  if (!snap.exists) return getDefaultStore();
  const data = snap.data() as unknown;
  if (!hasValidSections(data)) return getDefaultStore();
  return data;
}

export async function writeSectionsStore(uid: string, store: Store): Promise<void> {
  if (!adminApp) return;
  const db = getFirestore(adminApp);
  const ref = db.collection("users").doc(uid).collection("data").doc("sections");
  await ref.set(store);
}
