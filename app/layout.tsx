// layout.tsx (server component)

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  weight: "100",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Acculog - Attendance & Time Tracking System",
  description: "Created in NextJs Developed By Fluxx Tech Solutions",
  icons: {
    icon: "/ecodesk.png",
  },
  manifest: "/manifest.json", // ✅ Link PWA manifest
  themeColor: "#0f766e", // ✅ Theme color for address bar & install prompt
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Fallback if Next metadata doesn't auto inject */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f766e" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ToastContainer />
        {children}
        <Analytics />
        <SpeedInsights />

        {/* ✅ Register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(() => console.log('✅ Service Worker registered'))
                    .catch(err => console.log('❌ Service Worker registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
