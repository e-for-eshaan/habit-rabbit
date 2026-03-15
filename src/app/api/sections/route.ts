import { NextResponse } from "next/server";
import { get } from "lodash";
import { readStore, writeStore } from "@/lib/store";
import type { Section } from "@/types";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.sections);
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = (get(body, "title") as string)?.trim() ?? "";
  const colorKey = (get(body, "colorKey") as number) ?? 0;
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const store = await readStore();
  const section: Section = {
    id: crypto.randomUUID(),
    title,
    colorKey,
    updates: [],
  };
  store.sections = [...store.sections, section];
  await writeStore(store);
  return NextResponse.json(section, { status: 201 });
}
