import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import InstallPrompt from "./install-prompt";

const inter = Inter({
  weight: "100",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Acculog - Attendance & Time Tracking System",
  description: "Created in NextJs Developed By Fluxx Tech Solutions",
  icons: {
    icon: "/fluxx.png",
  },
  manifest: "/manifest.json",
  // themeColor removed
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* meta theme-color removed */}
      </head>
      <body className={`${inter.variable} font-sans antialiased relative`}>
        <ToastContainer />
        {children}

        {/* InstallPrompt with fixed position and high z-index */}
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <InstallPrompt />
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
