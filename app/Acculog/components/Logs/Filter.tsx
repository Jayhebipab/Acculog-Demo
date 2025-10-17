"use client";

import React from "react";

interface FilterProps {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

const Filter: React.FC<FilterProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <label className="flex flex-col text-xs font-medium text-gray-700 md:flex-row md:items-center md:gap-1">
        <span>From:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 rounded border px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring md:mt-0"
        />
      </label>

      <label className="flex flex-col text-xs font-medium text-gray-700 md:flex-row md:items-center md:gap-1">
        <span>To:</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 rounded border px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring md:mt-0"
        />
      </label>
    </div>
  );
};

export default Filter;
