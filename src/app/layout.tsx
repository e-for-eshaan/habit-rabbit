import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AntdAppProviders } from "@/components/AntdAppProviders";
import type { LayoutChildren } from "@/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Habit Rabbit",
  description: "Habit tracker with sections, updates, and calendar views",
};

export default function RootLayout({ children }: Readonly<LayoutChildren>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AntdAppProviders>{children}</AntdAppProviders>
      </body>
    </html>
  );
}
