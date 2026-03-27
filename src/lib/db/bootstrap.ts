import { getFirestore } from "firebase-admin/firestore";

import { getDefaultSectionsStore, storeFromFirestoreDocument } from "@/lib/db/sections";
import { viewSettingsFromFirestoreDocument } from "@/lib/db/viewSettings";
import { adminApp } from "@/lib/firebase/admin";
import type { Store } from "@/lib/store";

export type HomeBootstrap = {
  store: Store;
  viewSettings: Record<string, unknown>;
};

export async function readHomeBootstrap(uid: string): Promise<HomeBootstrap> {
  if (!adminApp) {
    return { store: getDefaultSectionsStore(), viewSettings: {} };
  }
  const db = getFirestore(adminApp);
  const dataCol = db.collection("users").doc(uid).collection("data");
  const sectionsRef = dataCol.doc("sections");
  const viewSettingsRef = dataCol.doc("viewSettings");
  const [sectionsSnap, viewSettingsSnap] = await db.getAll(sectionsRef, viewSettingsRef);
  return {
    store: storeFromFirestoreDocument(sectionsSnap.exists, sectionsSnap.data()),
    viewSettings: viewSettingsFromFirestoreDocument(
      viewSettingsSnap.exists,
      viewSettingsSnap.data()
    ),
  };
}
