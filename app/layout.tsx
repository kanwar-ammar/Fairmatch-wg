import React from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Source_Sans_3 } from "next/font/google";
import { AppProviders } from "@/components/app-providers";

import "./globals.css";

const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const _sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "FairMatch WG - Bias-Free Student Housing",
  description:
    "Find your perfect WG in Germany. Trust-first, bias-free matching for students.",
};

export const viewport: Viewport = {
  themeColor: "#e07830",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${_dmSans.variable} ${_sourceSans.variable} font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
