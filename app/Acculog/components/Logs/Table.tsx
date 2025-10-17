"use client";

import React from "react";

interface SessionLog {
  status: string;
  timestamp: string;
  _id?: string;
}

interface SessionTableProps {
  data: SessionLog[];
}

// Time Format in Philippines 
const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
};

const SessionTable: React.FC<SessionTableProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-gray-500">
        No session logs found.
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    login: "bg-green-800",
    logout: "bg-red-800",
  };

  return (
    <>
      <ul className="space-y-2 md:hidden">
        {data.map((log, idx) => (
          <li
            key={log._id ?? idx}
            className="rounded-lg border p-3 shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`rounded-xl px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${
                  statusColors[log.status] || "bg-gray-400"
                }`}
              >
                {log.status}
              </span>
              <span className="text-gray-600">
                {formatDateTime(log.timestamp)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="hidden w-full overflow-x-auto md:block">
        <table className="min-w-full table-fixed text-left text-xs">
          <thead className="bg-gray-100">
            <tr className="border-l-4 border-cyan-400">
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data.map((log, idx) => (
              <tr
                key={log._id ?? idx}
                className="whitespace-nowrap border-b hover:bg-gray-50"
              >
                <td className="px-4 py-3 capitalize">
                  <span
                    className={`rounded-xl px-2 py-1 text-[10px] text-white shadow-md ${
                      statusColors[log.status] || "bg-gray-400"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">
                  {formatDateTime(log.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SessionTable;
