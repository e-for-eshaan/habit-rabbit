import { type App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminApp(): App | null {
  try {
    if (getApps().length > 0) {
      return getApp() as App;
    }
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (key) {
      const parsed = JSON.parse(key) as Record<string, unknown>;
      return initializeApp({ credential: cert(parsed as Parameters<typeof cert>[0]) });
    }
    if (path) {
      return initializeApp({ credential: cert(path) });
    }
    return null;
  } catch {
    return null;
  }
}

export const adminApp = getAdminApp();

export async function getAuthUserId(request: Request): Promise<string | null> {
  try {
    if (!adminApp) return null;
    const auth = getAuth(adminApp);
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const idToken = authHeader.slice(7).trim();
    if (!idToken) return null;
    const decoded = await auth.verifyIdToken(idToken);
    return decoded.uid ?? null;
  } catch {
    return null;
  }
}
