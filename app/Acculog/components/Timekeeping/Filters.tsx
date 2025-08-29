"use client";

import React from "react";
import { LuCloudDownload } from 'react-icons/lu';

interface FiltersProps {
  search: string;
  setSearchAction: (val: string) => void;
  department: string;
  setDepartmentAction: (val: string) => void;
  startDate: string;
  setStartDateAction: (val: string) => void;
  endDate: string;
  setEndDateAction: (val: string) => void;
  departments: string[];
  allLogs: any[];
  handleExportExcelAction: (logs: any[], filename: string) => void;
  filterByDateAction: (logs: any[]) => any[];
}

export default function Filters({
  search,
  setSearchAction,
  department,
  setDepartmentAction,
  startDate,
  setStartDateAction,
  endDate,
  setEndDateAction,
  departments,
  allLogs,
  handleExportExcelAction,
  filterByDateAction,
}: FiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
      {/* Left Side Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearchAction(e.target.value)}
          className="border px-3 py-2 rounded-md w-full sm:w-56 text-xs"
        />

        {/* Department Filter */}
        <select
          value={department}
          onChange={(e) => setDepartmentAction(e.target.value)}
          className="border px-3 py-2 rounded-md text-xs w-full sm:w-auto"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDateAction(e.target.value)}
            className="border px-2 py-2 rounded text-xs w-full sm:w-auto"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDateAction(e.target.value)}
            className="border px-2 py-2 rounded text-xs w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Right Side Export Button */}
      <button
        onClick={() =>
          handleExportExcelAction(filterByDateAction(allLogs), "All_ActivityLogs")
        }
        className="bg-green-600 text-white px-4 py-2 rounded-md text-xs hover:bg-green-700 self-end md:self-auto flex gap-1"
      >
       <LuCloudDownload size={20}/> Download All
      </button>
    </div>
  );
}
