import type { ThemeConfig } from "antd";
import { theme } from "antd";

export const appDarkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgBase: "#09090b",
    colorBgContainer: "#18181b",
    colorBgElevated: "#27272a",
    colorBorder: "rgba(255, 255, 255, 0.1)",
    colorBorderSecondary: "rgba(255, 255, 255, 0.06)",
    colorText: "#fafafa",
    colorTextSecondary: "#a1a1aa",
    colorTextTertiary: "#71717a",
    colorPrimary: "#a3e635",
    borderRadius: 12,
    borderRadiusLG: 16,
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  components: {
    Input: {
      colorBgContainer: "#27272a",
      activeBorderColor: "rgba(255, 255, 255, 0.2)",
      hoverBorderColor: "rgba(255, 255, 255, 0.15)",
    },
    Card: {
      colorBgContainer: "#18181b",
      colorBorderSecondary: "rgba(255, 255, 255, 0.08)",
    },
    Button: {
      defaultBg: "#27272a",
      defaultBorderColor: "rgba(255, 255, 255, 0.12)",
      defaultColor: "#fafafa",
    },
    Segmented: {
      itemSelectedBg: "#3f3f46",
      trackBg: "#27272a",
    },
  },
};

export const popoverDarkTheme: ThemeConfig = appDarkTheme;
