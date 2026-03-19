import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { LayoutChildren } from "@/types";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import "./globals.css";

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AntdRegistry>
          <AuthProvider>
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
