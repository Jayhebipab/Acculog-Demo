"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TourProvider, useTour } from "@reactour/tour";
import ParentLayout from "../../components/Layouts/ParentLayout";
import SessionChecker from "../../components/Session/SessionChecker";
import Chart from "../../components/Chart/ActivityChart";
import Form from "../../components/Activity/Form";
import { ToastContainer, toast } from "react-toastify";
import { IoClose, IoAdd } from "react-icons/io5";
import "react-toastify/dist/ReactToastify.css";

// Dynamically import the map so it only renders on the client
const MapCard = dynamic(() => import("../../components/Chart/MapChart"), {
  ssr: false,
  loading: () => <p className="text-center py-10">Loading map…</p>,
});

// Tutorial steps
const tutorialSteps = [
  {
    selector: ".create-activity-btn",
    content: "Click here to create a new activity log.",
  },
  {
    selector: ".chart-section",
    content: "This chart shows your activities over time.",
  },
  {
    selector: ".map-section",
    content: "This map displays the locations of your activities.",
  },
];

// Button to trigger the tutorial
function StartTutorialButton() {
  const { setIsOpen } = useTour();
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="mb-4 bg-blue-600 text-white text-xs px-4 py-2 rounded shadow hover:bg-blue-700 transition"
    >
      📘 Start Tutorial
    </button>
  );
}

function DashboardContent() {
  interface FormData {
    ReferenceID: string;
    Email: string;
    Type: string;
    Status: string;
    _id?: string;
    Remarks: string;
    date_created?: string;
  }

  const { setIsOpen } = useTour();

  const [userDetails, setUserDetails] = useState({
    UserId: "",
    ReferenceID: "",
    Manager: "",
    TSM: "",
    Firstname: "",
    Lastname: "",
    Email: "",
    Role: "",
    Department: "",
    Company: "",
  });

  const [posts, setPosts] = useState<any[]>([]);

  // Default date: today
  const today = new Date();
  const [startDate, setStartDate] = useState(today.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [form, setForm] = useState<FormData>({
    ReferenceID: "",
    Email: "",
    Type: "",
    Status: "",
    Remarks: "",
  });

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ModuleSales/Activity/FetchLog");
      const data = await res.json();
      setPosts(data.data);
    } catch (error) {
      toast.error("Error fetching activity logs.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  // Fetch user details
  useEffect(() => {
    const userId = new URLSearchParams(window.location.search).get("id");
    if (!userId) return;

    (async () => {
      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        const data = await res.json();
        setUserDetails({
          UserId: data._id,
          ReferenceID: data.ReferenceID ?? "",
          Manager: data.Manager ?? "",
          TSM: data.TSM ?? "",
          Firstname: data.Firstname ?? "",
          Lastname: data.Lastname ?? "",
          Email: data.Email ?? "",
          Role: data.Role ?? "",
          Department: data.Department ?? "",
          Company: data.Company ?? "",
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Auto-start tutorial for first time visitors
  useEffect(() => {
    const hasVisited = localStorage.getItem("dashboard_tutorial_seen");
    if (!hasVisited) {
      setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("dashboard_tutorial_seen", "true");
      }, 1000); // Delay to ensure elements are rendered
    }
  }, [setIsOpen]);

  const endDateWithOffset = endDate
    ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
    : null;

  const filteredAccounts = posts
    .filter((p) => {
      const d = p.date_created ? new Date(p.date_created) : null;
      const inRange =
        (!startDate || (d && d >= new Date(startDate))) &&
        (!endDateWithOffset || (d && d < endDateWithOffset));

      const isHR = userDetails.Department === "Human Resources";
      const isSuperAdmin = userDetails.Role === "Super Admin";

      const matchID =
        p.referenceid === userDetails.ReferenceID ||
        p.ReferenceID === userDetails.ReferenceID;

      // ✅ Super Admin and HR see all, others see only their own
      return inRange && (isSuperAdmin || isHR || matchID);
    })
    .sort((a, b) => +new Date(b.date_created) - +new Date(a.date_created));


  const chartData = Object.entries(
    filteredAccounts.reduce<Record<string, number>>((acc, p) => {
      if (!p.date_created) return acc;
      const key = new Date(p.date_created).toISOString().slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const clearRange = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleFormChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (userDetails.ReferenceID && userDetails.Email) {
      setForm((prev) => ({
        ...prev,
        ReferenceID: userDetails.ReferenceID,
        Email: userDetails.Email,
      }));
    }
  }, [userDetails.ReferenceID, userDetails.Email]);

  const openFormWithAnimation = () => {
    setShowForm(true);
    setTimeout(() => setAnimateForm(true), 10);
  };

  const closeFormWithAnimation = () => {
    setAnimateForm(false);
    setTimeout(() => setShowForm(false), 300);
  };

  return (
    <SessionChecker>
      <ParentLayout>
        <div className="container mx-auto p-4">
          <StartTutorialButton />

          {/* Form Overlay */}
          {showForm && (
            <div
              className={`fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/50 backdrop-blur-sm transition-all duration-500 ${animateForm ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            >
              <Form
                formData={form}
                onChange={handleFormChange}
                userDetails={userDetails}
                fetchAccount={fetchAccount}
                setForm={setForm}
                setShowForm={closeFormWithAnimation}
              />
            </div>
          )}

          <h1 className="text-3xl font-extrabold mb-6">
            Dashboard
          </h1>

          {/* Date Range Filter */}
          <div className="bg-white shadow-lg rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 sm:items-end text-black">
            <div className="flex flex-col">
              <label htmlFor="startDate" className="text-xs font-medium mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg p-2 text-xs"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="endDate" className="text-xs font-medium mb-1">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg p-2 text-xs"
              />
            </div>
            <button
              onClick={clearRange}
              className="bg-gray-100 border rounded-lg p-2 text-xs flex items-center gap-1"
            >
              <IoClose size={15} /> Clear range
            </button>
            <button
              onClick={openFormWithAnimation}
              className="create-activity-btn bg-green-700 text-white rounded-lg p-2 text-xs flex items-center gap-1"
            >
              <IoAdd size={15} /> Create Activity
            </button>
          </div>

          {/* Chart Section */}
          <div className="chart-section bg-white shadow-lg rounded-xl p-6 mb-6 text-black">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Activities Over Time
            </h2>
            <Chart data={chartData} />
          </div>

          {/* Map Section */}
          <div className="map-section animate-fadeIn">
            <MapCard posts={filteredAccounts} />
          </div>
        </div>

        <ToastContainer className="text-xs" autoClose={1000} />
      </ParentLayout>
    </SessionChecker>
  );
}

export default function DashboardPage() {
  return (
    <TourProvider
      steps={tutorialSteps}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: "12px",
          padding: "20px",
          background: "#fff",
          color: "#333",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        maskWrapper: (base) => ({
          ...base,
          color: "rgba(0,0,0,0.4)",
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: "#2563eb",
        }),
        close: (base) => ({
          ...base,
          color: "#555",
        }),
      }}
    >
      <DashboardContent />
    </TourProvider>
  );
}
