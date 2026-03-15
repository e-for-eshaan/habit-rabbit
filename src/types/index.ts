import type { ReactNode } from "react";

export type LayoutChildren = {
  children: ReactNode;
};

export type Update = {
  id: string;
  text: string;
  createdAt: string;
};

export type Section = {
  id: string;
  title: string;
  colorKey: number;
  updates: Update[];
};
