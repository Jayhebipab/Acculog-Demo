"use client";

import React, { useState, useMemo } from "react";

interface HistoryItem {
  Type: string;
  Status: string;
  date_created: string;
  Email?: string;
}

interface LocWithDist {
  lat: number;
  lon: number;
  cnt: number;
  name?: string;
  dist: number;
  walkTime: string;
  driveTime: string;
  history?: HistoryItem[];
}

interface SidebarListingProps {
  locsWithDist: LocWithDist[];
  flyTo: (lat: number, lon: number) => void;
}

const SidebarListing: React.FC<SidebarListingProps> = ({
  locsWithDist,
  flyTo,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const filtered = useMemo(() => {
    if (!query.trim()) return locsWithDist;
    const q = query.toLowerCase();
    return locsWithDist.filter(({ name, lat, lon }) => {
      const coords = `${lat.toFixed(5)},${lon.toFixed(5)}`;
      return name?.toLowerCase().includes(q) || coords.includes(q);
    });
  }, [query, locsWithDist]);

  return (
    <div className="md:w-1/3 flex flex-col gap-2 text-xs text-black">
      <h3 className="font-semibold">
        Location Visit Counts (Distance &amp; ETA)
      </h3>

      <input
        type="text"
        placeholder="Search by name or coords…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border px-2 py-1 rounded-md shadow-inner focus:outline-none focus:ring focus:ring-blue-300"
      />

      <div className="overflow-auto max-h-96 pr-1">
        <ul className="space-y-2">
          {filtered.length === 0 && <li>No matching locations.</li>}
          {filtered.map(({ lat, lon, cnt, name, dist, walkTime, driveTime, history = [] }, i) => {
            const isOpen = open[i];
            const grouped = history.reduce<Record<string, HistoryItem[]>>(
              (acc, h) => {
                acc[h.Type] = acc[h.Type] ? [...acc[h.Type], h] : [h];
                return acc;
              },
              {}
            );

            return (
              <li
                key={i}
                className="border shadow-md rounded-md divide-y text-[11px]"
              >
                <button
                  className="w-full text-left p-2 text-black hover:text-green-800 focus:outline-none flex items-start gap-2"
                  onClick={() => flyTo(lat, lon)}
                >
                  <span>
                    <strong>{cnt}</strong> visit{cnt > 1 ? "s" : ""} •{" "}
                    {dist.toFixed(2)} km • 🚶‍♂️ {walkTime} • 🚗 {driveTime}
                    <br />
                    {name
                      ? `${name} (${lat.toFixed(5)}, ${lon.toFixed(5)})`
                      : `(${lat.toFixed(5)}, ${lon.toFixed(5)})`}
                  </span>
                </button>

                <div className="p-2 flex justify-end items-center gap-2">
                  <button
                    onClick={() => setOpen({ ...open, [i]: !isOpen })}
                    className="text-green-700 hover:underline focus:outline-none"
                  >
                    {isOpen ? "Hide" : "View more"}
                  </button>
                </div>

                {isOpen && (
                  <div className="p-2 space-y-2">
                    {history.length === 0 && (
                      <p className="italic text-gray-500">No history found.</p>
                    )}

                    {Object.entries(grouped).map(([type, rows]) => (
                      <div key={type}>
                        <p className="font-semibold mb-1">{type}</p>
                        <ul className="border-l pl-2 space-y-[1px]">
                          {rows.map((r, idx) => (
                            <li
                              key={idx}
                              className="flex flex-col sm:flex-row sm:justify-between sm:items-center pr-1"
                            >
                              <div className="flex flex-col">
                                <span>
                                  <strong>{r.Status}</strong>
                                </span>
                                {r.Email && (
                                  <span className="text-gray-600">
                                    📧 {r.Email}
                                  </span>
                                )}
                              </div>
                              <span className="tabular-nums text-gray-700">
                                {r.date_created
                                  ? new Date(r.date_created).toLocaleString()
                                  : "No date available"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SidebarListing;
