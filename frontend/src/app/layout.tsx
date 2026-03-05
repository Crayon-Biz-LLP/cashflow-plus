import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Solv Prod — Strategy in Motion. Finance in Control.",
  description: "A modern Legal-Fintech ERP platform for managing cases, invoices, expenses, and AI-driven financial analytics. Built for law firms and financial professionals.",
};

import TimelineAlerts from "@/components/TimelineAlerts";
import GlobalToast from "@/components/GlobalToast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <TimelineAlerts />
        <GlobalToast />
      </body>
    </html>
  );
}
