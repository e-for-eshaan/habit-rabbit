import { NextResponse } from "next/server";
import { get, isNil } from "lodash";
import type { Section } from "@/types";
import { readStore, writeStore } from "@/lib/store";
import type { Update } from "@/types";

type Params = { params: Promise<{ sectionId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { sectionId } = await params;
  const body = await request.json();
  const text = (get(body, "text") as string)?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const createdAtRaw = get(body, "createdAt");
  const createdAt =
    typeof createdAtRaw === "string" && !Number.isNaN(new Date(createdAtRaw).getTime())
      ? new Date(createdAtRaw).toISOString()
      : new Date().toISOString();
  const store = await readStore();
  const section = store.sections.find((s: Section) => s.id === sectionId);
  if (isNil(section)) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  const update: Update = {
    id: crypto.randomUUID(),
    text,
    createdAt,
  };
  section.updates = [update, ...section.updates];
  await writeStore(store);
  return NextResponse.json(update, { status: 201 });
}
