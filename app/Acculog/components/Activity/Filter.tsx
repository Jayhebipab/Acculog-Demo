import React from "react";
import { FaSearch, FaFilter, FaCalendarAlt, FaTimes } from "react-icons/fa";

interface FilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

const Filter: React.FC<FilterProps> = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="flex flex-wrap md:flex-row md:items-center gap-3 mb-4 p-3 bg-white rounded-lg shadow-sm border">
      {/* Search input */}
      <div className="relative flex-grow md:flex-grow-0">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
        <input
          type="text"
          placeholder="Search by Type or Status"
          className="pl-8 pr-3 py-2 border rounded text-xs w-full md:w-52 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm capitalize"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter by Type */}
      <div className="relative">
        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
        <select
          className="pl-8 pr-3 py-2 border rounded text-xs w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm capitalize"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="HR Attendance">HR Attendance</option>
          <option value="On Field">On Field</option>
          <option value="Site Visit">Site Visit</option>
          <option value="On Site">On Site</option>
        </select>
      </div>

      {/* Start Date */}
      <div className="relative">
        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="pl-8 pr-3 py-2 border rounded text-xs w-full md:w-36 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        />
      </div>

      {/* End Date */}
      <div className="relative">
        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="pl-8 pr-3 py-2 border rounded text-xs w-full md:w-36 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        />
      </div>

      {/* Clear Filters Button */}
      {(searchQuery || filterType || startDate || endDate) && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition"
        >
          <FaTimes /> Clear
        </button>
      )}
    </div>
  );
};

export default Filter;
