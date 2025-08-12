import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ActivityLog {
  ReferenceID: string;
  Email: string;
  Type: string;
  Status: string;
  Location: string;
  date_created: string;
  PhotoURL?: string;
  _id?: string;
}

interface TableProps {
  data: ActivityLog[];
  onEdit: (log: ActivityLog) => void;
  department: string;
}

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const computeTimeRemarks = (log: ActivityLog): string => {
  const logDate = new Date(log.date_created);
  const workStart = new Date(log.date_created);
  workStart.setHours(8, 0, 0, 0);
  const workEndGrace = new Date(log.date_created);
  workEndGrace.setHours(17, 10, 0, 0);

  if (log.Status.toLowerCase() === "login") {
    if (logDate > workStart) {
      const lateMinutes = Math.round((logDate.getTime() - workStart.getTime()) / 60000);
      return `Late by ${lateMinutes} min`;
    }
    return "On Time";
  }

  if (log.Status.toLowerCase() === "logout") {
    if (logDate > workEndGrace) {
      const overtimeMinutes = Math.round((logDate.getTime() - workEndGrace.getTime()) / 60000);
      return `OT +${overtimeMinutes} min`;
    }
    return "On Time";
  }

  return "-";
};

const Table: React.FC<TableProps> = ({ data, onEdit, department }) => {
  const [activeTab, setActiveTab] = useState<"table" | "card">("table");

  const statusColors: { [key: string]: string } = {
    Login: "bg-green-800",
    Logout: "bg-red-800",
  };

  const getRemarkBadgeColor = (remark: string) => {
    if (remark === "On Time") return "bg-green-600";
    if (remark.startsWith("Late")) return "bg-yellow-500";
    if (remark.startsWith("OT")) return "bg-blue-600";
    return "bg-gray-400";
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Activity Logs");

    worksheet.columns = [
      { header: "Email", key: "Email", width: 30 },
      { header: "Type", key: "Type", width: 15 },
      { header: "Status", key: "Status", width: 15 },
      { header: "Location", key: "Location", width: 20 },
      { header: "Date & Time", key: "Date", width: 25 },
      { header: "Remarks", key: "Remarks", width: 20 },
    ];

    data.forEach((log) => {
      worksheet.addRow({
        Email: log.Email,
        Type: log.Type,
        Status: log.Status,
        Location: log.Location,
        Date: formatDateTime(log.date_created),
        Remarks: computeTimeRemarks(log),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "activity-logs.xlsx");
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 text-xs font-medium ${activeTab === "table" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          onClick={() => setActiveTab("table")}
        >
          Table View
        </button>
        <button
          className={`px-4 py-2 text-xs font-medium ${activeTab === "card" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          onClick={() => setActiveTab("card")}
        >
          Card View
        </button>
      </div>

      {/* Export button */}
      {department === "Human Resources" && activeTab === "table" && (
        <div className="flex justify-end mb-2">
          <button
            onClick={exportToExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs shadow"
          >
            Export to Excel
          </button>
        </div>
      )}

      {/* Table View */}
      {activeTab === "table" && (
        <div className="overflow-x-auto w-full rounded-lg shadow-md border border-gray-200">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white sticky top-0 z-10 shadow">
              <tr className="text-xs text-left whitespace-nowrap">
                <th className="px-6 py-4 font-semibold">📧 User Email</th>
                <th className="px-6 py-4 font-semibold">📌 Type</th>
                <th className="px-6 py-4 font-semibold">📊 Status</th>
                <th className="px-6 py-4 font-semibold">⏰ Remarks</th>
                <th className="px-6 py-4 font-semibold">📍 Location</th>
                <th className="px-6 py-4 font-semibold">📅 Date &amp; Time</th>
                <th className="px-6 py-4 font-semibold">🖼 View Image</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((log, idx) => {
                  const remark = computeTimeRemarks(log);
                  const remarkColor = getRemarkBadgeColor(remark);

                  // Icon based on remark
                  let remarkIcon = "🙂";
                  if (remark.startsWith("Late")) remarkIcon = "😅";
                  if (remark.startsWith("OT")) remarkIcon = "💪";
                  if (remark === "On Time") remarkIcon = "😁";

                  return (
                    <tr
                      key={log._id ?? idx}
                      className={`whitespace-nowrap hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                    >
                      <td className="px-6 py-4 text-xs">{log.Email}</td>
                      <td className="px-6 py-4 text-xs capitalize">{log.Type}</td>
                      <td className="px-6 py-4 text-xs capitalize">
                        <span
                          className={`text-white shadow-md text-[10px] px-2 py-1 mr-2 rounded-full ${statusColors[log.Status] || "bg-gray-400"
                            }`}
                        >
                          {log.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 text-white shadow-md text-[10px] px-2 py-1 rounded-full ${remarkColor}`}
                        >
                          {remarkIcon} {remark}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs capitalize">{log.Location}</td>
                      <td className="px-6 py-4 text-xs">{formatDateTime(log.date_created)}</td>
                      <td className="px-6 py-4 text-xs">
                        {log.PhotoURL ? (
                          <a
                            href={log.PhotoURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            📷 View Image
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">No Image</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="border px-4 py-2 text-center text-gray-500">
                    No activity logs found for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {activeTab === "card" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.length > 0 ? (
            data.map((log, idx) => {
              const remark = computeTimeRemarks(log);
              const remarkColor = getRemarkBadgeColor(remark);

              // Emoji based on remark
              let remarkEmoji = "🙂";
              if (remark.startsWith("Late")) remarkEmoji = "😅";
              if (remark.startsWith("OT")) remarkEmoji = "💪";
              if (remark === "On Time") remarkEmoji = "😁";

              return (
                <div
                  key={log._id ?? idx}
                  className="border rounded-xl shadow-md p-5 bg-white hover:shadow-xl transition-transform transform hover:-translate-y-1 hover:scale-105 duration-200"
                >
                  {/* Header with profile */}
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-sm">
                      {log.PhotoURL ? (
                        <img
                          src={log.PhotoURL}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 text-xs">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-bold">{log.Email}</h3>
                      <span
                        className={`text-white text-[10px] px-2 py-1 rounded-full ${statusColors[log.Status] || "bg-gray-400"}`}
                      >
                        {log.Status}
                      </span>
                    </div>
                    <div className="text-xl">{remarkEmoji}</div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs text-gray-700">
                    <p><strong>Type:</strong> {log.Type}</p>
                    <p><strong>Location:</strong> {log.Location}</p>
                    <p><strong>Date:</strong> {formatDateTime(log.date_created)}</p>
                  </div>

                  {/* Remark */}
                  <div className="mt-3">
                    <span
                      className={`inline-block text-white text-[10px] px-3 py-1 rounded-full shadow-sm ${remarkColor}`}
                    >
                      {remark} {remarkEmoji}
                    </span>
                  </div>

                  {/* View Image link */}
                  {log.PhotoURL && (
                    <div className="mt-3">
                      <a
                        href={log.PhotoURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs font-medium hover:underline"
                      >
                        📷 View Image
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-sm">No activity logs found.</p>
          )}
        </div>
      )}

    </div>
  );
};

export default Table;
