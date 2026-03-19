import { get } from "lodash";
import type { Section, Update } from "@/types";
import type { FitnessState } from "@/types/fitness";

const BASE = "";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const message = get(err, "error", res.statusText) as string;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function getSections(): Promise<Section[]> {
  return fetchJson<Section[]>(`${BASE}/api/sections`);
}

export async function createSection(body: { title: string; colorKey?: number }): Promise<Section> {
  return fetchJson<Section>(`${BASE}/api/sections`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateSection(
  id: string,
  body: { title?: string; colorKey?: number }
): Promise<Section> {
  return fetchJson<Section>(`${BASE}/api/sections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteSection(id: string): Promise<void> {
  await fetchJson(`${BASE}/api/sections/${id}`, { method: "DELETE" });
}

export async function createUpdate(
  sectionId: string,
  body: { text: string; createdAt?: string }
): Promise<Update> {
  return fetchJson<Update>(`${BASE}/api/sections/${sectionId}/updates`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUpdate(
  sectionId: string,
  updateId: string,
  body: { text?: string; createdAt?: string }
): Promise<Update> {
  return fetchJson<Update>(`${BASE}/api/sections/${sectionId}/updates/${updateId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUpdate(sectionId: string, updateId: string): Promise<void> {
  await fetchJson(`${BASE}/api/sections/${sectionId}/updates/${updateId}`, { method: "DELETE" });
}

export async function getFitness(): Promise<FitnessState> {
  return fetchJson<FitnessState>(`${BASE}/api/fitness`);
}

export async function updateFitness(payload: FitnessState): Promise<FitnessState> {
  return fetchJson<FitnessState>(`${BASE}/api/fitness`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
