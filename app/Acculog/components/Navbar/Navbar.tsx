"use client";

import React, { useState, useEffect, useRef } from "react";
import { CiDark, CiSun } from "react-icons/ci";
import { IoMenu } from "react-icons/io5";

interface NavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

interface UserData {
  Firstname: string;
  Email: string;
  ReferenceID?: string;
  TargetQuota?: string;
  Role?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onToggleTheme, isDarkMode }) => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userReferenceId, setUserReferenceId] = useState("");
  const [targetQuota, setTargetQuota] = useState("");
  const [role, setRole] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Handle clicks outside sidebar to close it
  useEffect(() => {
    const handleClickOutsideSidebar = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // You had local state showSidebar but it was not used here,
        // so consider removing or managing sidebar state outside Navbar
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSidebar);
    return () => document.removeEventListener("mousedown", handleClickOutsideSidebar);
  }, []);

  // Sync dark mode class and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Fetch user data from URL param on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");
      if (!userId) return;

      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data: UserData = await res.json();

        setUserName(data.Firstname);
        setUserEmail(data.Email);
        setUserReferenceId(data.ReferenceID || "");
        setTargetQuota(data.TargetQuota || "");
        setRole(data.Role || "");
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  // Handle clicks outside dropdowns to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Close dropdown logic here if dropdown state is added in future
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        // Close notifications logic here if notifications state is added
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-[999] flex justify-between items-center p-4 transition-all duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
          aria-label="Toggle sidebar menu"
          className="flex items-center gap-2 bg-green-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <IoMenu size={20} />
          <span>Menu</span>
        </button>

      </div>

      <div
        className="relative flex items-center gap-2 text-xs z-[1000]"
        ref={dropdownRef}
      >
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="relative flex items-center bg-gray-200 dark:bg-gray-700 w-20 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer"
        >
          <div
            className={`w-5 h-5 bg-white dark:bg-yellow-400 rounded-full shadow-md flex justify-center items-center transform transition-transform duration-300 ${isDarkMode ? "translate-x-12" : "translate-x-0"
              }`}
          >
            {isDarkMode ? (
              <CiDark size={12} className="text-gray-900 dark:text-gray-300" />
            ) : (
              <CiSun size={12} className="text-yellow-500" />
            )}
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
