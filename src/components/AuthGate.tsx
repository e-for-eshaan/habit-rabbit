"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthShellSkeleton } from "@/components/skeletons";
import { ViewSettingsPersistence } from "@/components/ViewSettingsPersistence";
import { useAuth } from "@/contexts/AuthContext";

const LOGIN_PATH = "/login";
const HOME_PATH = "/";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (user && pathname === LOGIN_PATH) {
      router.replace(HOME_PATH);
      return;
    }
    if (!user && pathname !== LOGIN_PATH) {
      router.replace(LOGIN_PATH);
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <AuthShellSkeleton />;
  }

  if (!user && pathname !== LOGIN_PATH) {
    return (
      <div className="flex min-h-screen items-center justify-center px-page py-section">
        <p className="text-body text-muted-fg">Redirecting to sign in…</p>
      </div>
    );
  }

  if (user && pathname === LOGIN_PATH) {
    return (
      <div className="flex min-h-screen items-center justify-center px-page py-section">
        <p className="text-body text-muted-fg">Redirecting…</p>
      </div>
    );
  }

  return (
    <>
      {user ? <ViewSettingsPersistence /> : null}
      {children}
    </>
  );
}
