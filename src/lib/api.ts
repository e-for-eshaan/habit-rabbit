import { get } from "lodash";

import { getApiToken } from "@/lib/apiAuth";
import type { Section, Update } from "@/types";
import type { FitnessState } from "@/types/fitness";
import type { FitnessDashboardData } from "@/types/fitnessDashboard";

const BASE = "";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = await getApiToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const contentType = res.headers.get("Content-Type") ?? "";
    let message = res.statusText;
    if (contentType.includes("application/json")) {
      const err = await res.json().catch(() => ({}));
      message = (get(err, "error") as string) || message;
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export type BootstrapPayload = {
  sections: Section[];
  viewSettings: Record<string, unknown>;
};

export async function getBootstrap(): Promise<BootstrapPayload> {
  return fetchJson<BootstrapPayload>(`${BASE}/api/bootstrap`);
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

export async function getFitnessDashboard(): Promise<FitnessDashboardData> {
  return fetchJson<FitnessDashboardData>(`${BASE}/api/fitness/dashboard`);
}

export async function getViewSettings(): Promise<Record<string, unknown>> {
  return fetchJson<Record<string, unknown>>(`${BASE}/api/settings`);
}

export async function updateViewSettings(data: Record<string, unknown>): Promise<void> {
  await fetchJson(`${BASE}/api/settings`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
