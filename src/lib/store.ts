import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { isNil } from "lodash";
import type { Section } from "@/types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "store.json");

export type Store = { sections: Section[] };

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

export async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(STORE_PATH, "utf-8");
    const data = JSON.parse(raw) as Store;
    if (!hasValidSections(data)) {
      return { sections: DEFAULT_SECTIONS };
    }
    return data;
  } catch {
    return { sections: DEFAULT_SECTIONS };
  }
}

export async function writeStore(store: Store): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}
