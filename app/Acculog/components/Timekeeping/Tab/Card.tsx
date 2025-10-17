"use client";

import React from "react";
import { LuLogs, LuCloudDownload } from "react-icons/lu";
import LogModal from "../Modal/Log";
import QRModal from "../Modal/QR";

export interface ActivityLog {
  ReferenceID: string;
  Email: string;
  Department: string;
  Type: string;
  Status: string;
  date_created: string;
  _id?: string;
  Firstname?: string;
  Lastname?: string;
  profilePicture?: string;
}

interface CardProps {
  email: string;
  logs: ActivityLog[];
  filteredLogs: ActivityLog[];
  openModal: string | null;
  setOpenModal: (email: string | null) => void;
  qrModal: string | null;
  qrData: string | null;
  qrLoading: boolean;
  setQrModal: (email: string | null) => void;
  setQrData: (data: string | null) => void;
  formatDate: (date: string) => string;
  computeRemarks: (log: ActivityLog) => string;
  handleExportExcel: (logs: ActivityLog[], filename: string) => void;
}

const Card: React.FC<CardProps> = ({
  email,
  logs,
  filteredLogs,
  openModal,
  setOpenModal,
  qrModal,
  qrData,
  qrLoading,
  setQrModal,
  setQrData,
  formatDate,
  computeRemarks,
  handleExportExcel,
}) => {
  const fullname = `${logs[0].Firstname || ""} ${logs[0].Lastname || ""}`.trim();

  return (
    <div
      className="shadow-lg rounded-xl p-5 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300 bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* User Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={logs[0].profilePicture || "/fluxx.png"}
          alt={logs[0].Firstname || email}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate capitalize">{fullname}</p>
          <p className="text-xs text-gray-500 truncate">{logs[0].Department}</p>
          <p className="text-xs text-gray-400 truncate">{email}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3 items-center sm:items-start">
        {/* View Logs */}
        <button
          onClick={() => setOpenModal(email)}
          className="bg-blue-600 text-white px-3 py-2 rounded text-xs w-full sm:w-auto hover:bg-blue-700 flex items-center gap-1 justify-center"
        >
          <LuLogs size={20} />
          View
        </button>

        {/* Download Excel */}
        <button
          onClick={() =>
            handleExportExcel(
              filteredLogs,
              `${logs[0].Firstname}_${logs[0].Lastname}_Logs`
            )
          }
          className="bg-green-600 text-white px-3 py-2 rounded text-xs w-full sm:w-auto hover:bg-green-700 flex items-center gap-1 justify-center"
        >
          <LuCloudDownload size={20} />
          Download
        </button>
      </div>

      {/* Modals */}
      <LogModal
        isOpen={openModal === email}
        logs={filteredLogs}
        onClose={() => setOpenModal(null)}
        formatDate={formatDate}
        computeRemarks={computeRemarks}
      />

      <QRModal
        isOpen={qrModal === email}
        qrData={qrData}
        loading={qrLoading}
        onClose={() => {
          setQrModal(null);
          setQrData(null);
        }}
      />
    </div>
  );
};

export default Card;
