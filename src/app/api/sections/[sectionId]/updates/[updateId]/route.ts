import { NextResponse } from "next/server";
import { get, isNil } from "lodash";
import type { Section, Update } from "@/types";
import { readStore, writeStore } from "@/lib/store";

type Params = { params: Promise<{ sectionId: string; updateId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { sectionId, updateId } = await params;
  const body = await request.json();
  const store = await readStore();
  const section = store.sections.find((s: Section) => s.id === sectionId);
  if (isNil(section)) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  const update = section.updates.find((u: Update) => u.id === updateId);
  if (isNil(update)) {
    return NextResponse.json({ error: "Update not found" }, { status: 404 });
  }
  const text = get(body, "text");
  if (typeof text === "string") {
    update.text = text.trim();
  }
  const createdAt = get(body, "createdAt");
  if (typeof createdAt === "string") {
    const d = new Date(createdAt);
    if (!Number.isNaN(d.getTime())) update.createdAt = d.toISOString();
  }
  await writeStore(store);
  return NextResponse.json(update);
}

export async function DELETE(request: Request, { params }: Params) {
  const { sectionId, updateId } = await params;
  const store = await readStore();
  const section = store.sections.find((s: Section) => s.id === sectionId);
  if (isNil(section)) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  const index = section.updates.findIndex((u: Update) => u.id === updateId);
  if (index === -1) {
    return NextResponse.json({ error: "Update not found" }, { status: 404 });
  }
  section.updates = [...section.updates.slice(0, index), ...section.updates.slice(index + 1)];
  await writeStore(store);
  return NextResponse.json({ ok: true });
}
