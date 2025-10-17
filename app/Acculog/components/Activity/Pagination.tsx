"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  goToPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  goToPage,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 mt-4">
      {/* Items per page selector */}
      <div>
        <label htmlFor="itemsPerPage" className="mr-2 font-medium text-sm">
          Show:
        </label>
        <select
          id="itemsPerPage"
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            goToPage(1);
          }}
        >
          {[5, 10, 20, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination navigation */}
      <nav className="flex items-center space-x-1 text-sm" aria-label="Pagination">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            if (totalPages <= 5) return true;
            return (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 2 && page <= currentPage + 2)
            );
          })
          .map((page, idx, arr) => {
            if (idx > 0 && page - arr[idx - 1] > 1) {
              return (
                <React.Fragment key={`ellipsis-${page}`}>
                  <span className="px-2 select-none">…</span>
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize ${
                      page === currentPage ? "bg-black text-white" : "hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            }
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`shadow-sm px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize ${
                  page === currentPage ? "bg-black text-white" : "hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            );
          })}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
