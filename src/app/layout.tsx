import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { CSPostHogProvider } from "@/components/PostHogProvider"; // Import this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CashFlow+ | AI Finance",
  description: "Predict your cash crunch before it happens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CSPostHogProvider> {/* Wrap here */}
            {children}
          </CSPostHogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}