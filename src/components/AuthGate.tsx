"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthShellSkeleton } from "@/components/skeletons";
import { ViewSettingsPersistence } from "@/components/ViewSettingsPersistence";
import { useAuth } from "@/contexts/AuthContext";

const LOGIN_PATH = "/login";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== LOGIN_PATH) {
      router.replace(LOGIN_PATH);
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <AuthShellSkeleton />;
  }

  if (!user && pathname !== LOGIN_PATH) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-fg">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <ViewSettingsPersistence />
      {children}
    </>
  );
}
