import { NextResponse } from "next/server";

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

const FIREBASE_PERMISSION_DENIED_MSG =
  "Database unavailable. Ensure the Firebase service account has the Cloud Datastore User role for this project (Google Cloud Console → IAM → select the service account).";

export function apiErrorFromUnknown(e: unknown, fallback: string): NextResponse {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("PERMISSION_DENIED")) {
    return NextResponse.json({ error: FIREBASE_PERMISSION_DENIED_MSG }, { status: 503 });
  }
  return NextResponse.json({ error: msg || fallback }, { status: 500 });
}
