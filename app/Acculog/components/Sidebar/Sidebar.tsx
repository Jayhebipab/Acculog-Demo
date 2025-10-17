"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CiMemoPad } from "react-icons/ci";
import SidebarMenu from "./SidebarMenu";
import SidebarUserInfo from "./SidebarUserInfo";

interface SubItem {
  title: string;
  description: string;
  href: string;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  subItems: SubItem[];
}

interface UserDetails {
  Firstname: string;
  Lastname: string;
  Location: string;
  Role: string;
  Position: string;
  Company: string;
  Status: string;
  profilePicture: string;
  ReferenceID: string;
  Department: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    Firstname: "",
    Lastname: "",
    Location: "",
    Role: "",
    Position: "",
    Company: "",
    Status: "",
    profilePicture: "",
    ReferenceID: "",
    Department: "",
  });

  const [pendingInquiryCount, setPendingInquiryCount] = useState(0);
  const [pendingInactiveCount, setPendingInactiveCount] = useState(0);
  const [pendingDeleteCount, setPendingDeleteCount] = useState(0);
  const [agentMode, setAgentMode] = useState(false);
  
  // Get ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserId(params.get("id"));
  }, []);

  // Fetch User Information
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error("Failed to fetch user details");

        const data = await response.json();
        setUserDetails({
          Firstname: data.Firstname || "Leroux",
          Lastname: data.Lastname || "Xchire",
          Location: data.Location || "Philippines",
          Role: data.Role || "Admin",
          Position: data.Position || "Guest",
          Company: data.Company || "Fluxx",
          Department: data.Department || "",
          Status: data.Status || "None",
          ReferenceID: data.ReferenceID,
          profilePicture: data.profilePicture || "",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleToggle = (section: string) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  // Menu
  const getMenuItems = (userDetails: UserDetails, userId: string | null = ""): MenuItem[] => {
    const items: MenuItem[] = [
      {
        title: "Activities",
        icon: CiMemoPad,
        subItems: [
          {
            title: "Activity Logs",
            description: "View your recent activity records and task updates",
            href: `/Acculog/Attendance/Activity/ActivityLogs${userId ? `?id=${encodeURIComponent(userId)}` : ""}`,
          },
          {
            title: "Timekeeping",
            description: "View your recent activity records and task updates",
            href: `/Acculog/Attendance/Activity/Timekeeping${userId ? `?id=${encodeURIComponent(userId)}` : ""}`,
          },
        ],
      },
    ];

    return items.map((item) => {
      const filteredSubItems = item.subItems.filter((sub) => {
        if (sub.title === "Timekeeping") {
          return userDetails.Role === "Super Admin" || userDetails.Department === "Human Resources";
        }
        return true;
      });
      return { ...item, subItems: filteredSubItems };
    });
  };

  const menuItems = getMenuItems(userDetails, userId);

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-screen transition-all duration-300 flex flex-col
        ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} 
        ${collapsed ? "w-16" : "w-64"} 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center">
            <img src="/fluxx.png" alt="Logo" className="h-8 mr-2 rounded-full" />
            <Link href={`/Acculog/Attendance/Dashboard${userId ? `?id=${encodeURIComponent(userId)}` : ''}`}>
              <h1 className={`text-md font-bold transition-opacity ${collapsed ? "opacity-0" : "opacity-100"}`}>
                AccuLog
              </h1>
            </Link>
          </div>
        </div>

        {/* Menu */}
        <SidebarMenu
          collapsed={collapsed}
          openSections={openSections}
          handleToggle={handleToggle}
          menuItems={menuItems}
          userId={userId}
          pendingInquiryCount={pendingInquiryCount}
          pendingInactiveCount={pendingInactiveCount}
          pendingDeleteCount={pendingDeleteCount}
        />

        {/* User Info */}
        {!collapsed && (
          <SidebarUserInfo
            collapsed={collapsed}
            userDetails={userDetails}
            agentMode={agentMode}
            setAgentMode={setAgentMode}
          />
        )}
      </div>
    </>
  );
};

export default Sidebar;
