"use client";

import { App as AntApp, ConfigProvider } from "antd";

import { appDarkTheme } from "@/constants/antdTheme";
import type { LayoutChildren } from "@/types";

export function AppThemeProvider({ children }: Readonly<LayoutChildren>) {
  return (
    <ConfigProvider theme={appDarkTheme}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
