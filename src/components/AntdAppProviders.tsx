"use client";

import "@ant-design/v5-patch-for-react-19";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { ReactNode } from "react";

import { AppThemeProvider } from "@/components/AppThemeProvider";
import { AuthGate } from "@/components/AuthGate";
import { AuthProvider } from "@/contexts/AuthContext";

export function AntdAppProviders({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <AppThemeProvider>
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </AppThemeProvider>
    </AntdRegistry>
  );
}
