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
    fontSize: 16,
    fontSizeLG: 18,
    fontSizeSM: 14,
    fontSizeXL: 24,
    lineHeight: 1.5,
    lineHeightLG: 1.5,
    lineHeightSM: 1.43,
    controlHeight: 44,
    controlHeightLG: 44,
    controlHeightSM: 36,
    padding: 16,
    paddingLG: 24,
    paddingMD: 16,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginXS: 8,
    marginSM: 12,
  },
  components: {
    Input: {
      colorBgContainer: "#27272a",
      activeBorderColor: "rgba(255, 255, 255, 0.2)",
      hoverBorderColor: "rgba(255, 255, 255, 0.15)",
      paddingBlock: 10,
      paddingInline: 12,
    },
    Card: {
      colorBgContainer: "#18181b",
      colorBorderSecondary: "rgba(255, 255, 255, 0.08)",
      headerFontSize: 18,
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
