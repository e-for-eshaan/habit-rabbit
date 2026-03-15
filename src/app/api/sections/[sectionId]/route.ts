import { NextResponse } from "next/server";
import { get } from "lodash";
import type { Section } from "@/types";
import { readStore, writeStore } from "@/lib/store";

type Params = { params: Promise<{ sectionId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { sectionId } = await params;
  const body = await request.json();
  const store = await readStore();
  const index = store.sections.findIndex((s: Section) => s.id === sectionId);
  if (index === -1) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  const section = store.sections[index]!;
  const title = get(body, "title");
  if (typeof title === "string" && title.trim()) {
    section.title = title.trim();
  }
  const colorKey = get(body, "colorKey");
  if (typeof colorKey === "number") {
    section.colorKey = colorKey;
  }
  await writeStore(store);
  return NextResponse.json(section);
}

export async function DELETE(request: Request, { params }: Params) {
  const { sectionId } = await params;
  const store = await readStore();
  const index = store.sections.findIndex((s: Section) => s.id === sectionId);
  if (index === -1) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  store.sections = [...store.sections.slice(0, index), ...store.sections.slice(index + 1)];
  await writeStore(store);
  return NextResponse.json({ ok: true });
}
