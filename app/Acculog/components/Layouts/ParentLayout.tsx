"use client";

import React, { useState, useEffect, ReactNode } from "react";
// Components
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Roboto } from "next/font/google";

// Load Roboto font with weights 400 & 700 (adjust as needed)
const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

interface ParentLayoutProps {
  children: ReactNode;
}

const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setUserId(id);

    // Detect mobile viewport width < 768px
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when sidebar is open (mobile or desktop)
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
  }, [isSidebarOpen]);

  return (
    <div
      className={`${roboto.variable} font-sans flex ${
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar Overlay for both mobile and desktop */}
      {isSidebarOpen && (
        <>
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar panel with slide-in/out */}
          <div
            className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 z-50 shadow-lg transform transition-transform duration-300 ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
            >
              ✕
            </button>

            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isDarkMode={isDarkMode}
            />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-grow transition-all duration-300 relative z-10">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          isDarkMode={isDarkMode}
        />
        <main className="p-4 min-h-screen">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default ParentLayout;
