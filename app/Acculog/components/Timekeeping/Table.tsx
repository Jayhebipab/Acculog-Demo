"use client";

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Filters from "./Filters";
import QRModal from "./Modal/QR";
import LogModal from "./Modal/Log";
import { LuCloudDownload, LuLogs, LuQrCode } from "react-icons/lu";

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

interface TableProps {
    groupedByEmail: Record<string, ActivityLog[]>;
    expandedUsers: Record<string, boolean>;
    toggleUserLogs: (email: string) => void;
}

const Table: React.FC<TableProps> = ({ groupedByEmail }) => {
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [openModal, setOpenModal] = useState<string | null>(null);

    const [qrModal, setQrModal] = useState<string | null>(null); // track which user QR is open
    const [qrData, setQrData] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    const handleQrExport = async (logs: any[], filename: string, email: string) => {
        setQrModal(email); // open modal agad
        setQrLoading(true);
        const url = await handleExportExcel(logs, filename);
        setQrData(url);
        setQrLoading(false);
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });

    // 🔹 Compute remarks (Late or Overtime)
    const computeRemarks = (log: ActivityLog) => {
        const logDate = new Date(log.date_created);

        // standard working times
        const startOfDay = new Date(logDate);
        startOfDay.setHours(8, 0, 0, 0);

        const endOfDay = new Date(logDate);
        endOfDay.setHours(17, 30, 0, 0);

        let diffMs = 0;
        let label = "";

        if (log.Status.toLowerCase() === "login" && logDate > startOfDay) {
            // late
            diffMs = logDate.getTime() - startOfDay.getTime();
            label = "Late";
        } else if (log.Status.toLowerCase() === "logout" && logDate > endOfDay) {
            // overtime
            diffMs = logDate.getTime() - endOfDay.getTime();
            label = "Overtime";
        }

        if (diffMs > 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            return `${label}: ${hours}h ${minutes}m ${seconds}s`;
        }

        return "On Time";
    };

    // 🔹 Export function with Totals
    const handleExportExcel = async (logs: ActivityLog[], filename: string) => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Logs");

        sheet.addRow(["Date", "Fullname", "Status", "Type", "Department", "Remarks"]);

        let totalLateMs = 0;
        let totalOvertimeMs = 0;

        logs.forEach((log) => {
            const fullname = `${log.Firstname || ""} ${log.Lastname || ""}`.trim();
            const remarks = computeRemarks(log);

            // 🔹 Compute total Late & Overtime
            const logDate = new Date(log.date_created);
            const startOfDay = new Date(logDate);
            startOfDay.setHours(8, 0, 0, 0);

            const endOfDay = new Date(logDate);
            endOfDay.setHours(17, 30, 0, 0);

            if (log.Status.toLowerCase() === "login" && logDate > startOfDay) {
                totalLateMs += logDate.getTime() - startOfDay.getTime();
            } else if (log.Status.toLowerCase() === "logout" && logDate > endOfDay) {
                totalOvertimeMs += logDate.getTime() - endOfDay.getTime();
            }

            sheet.addRow([
                formatDate(log.date_created),
                fullname,
                log.Status,
                log.Type,
                log.Department,
                remarks,
            ]);
        });

        // 🔹 Helper: Format ms → h m s
        const formatDuration = (ms: number) => {
            const hours = Math.floor(ms / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((ms % (1000 * 60)) / 1000);
            return `${hours}h ${minutes}m ${seconds}s`;
        };

        // 🔹 Append totals row
        sheet.addRow([]);
        sheet.addRow(["", "TOTALS"]);
        sheet.addRow(["", "Total Late", formatDuration(totalLateMs)]);
        sheet.addRow(["", "Total Overtime", formatDuration(totalOvertimeMs)]);

        // 🔹 Generate Excel buffer
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // ✅ Local download (browser save)
        saveAs(blob, `${filename}.xlsx`);

        // ✅ Upload to backend for QR Code download
        try {
            const formData = new FormData();
            formData.append("file", blob, `${filename}.xlsx`);

            const res = await fetch("/api/save-excel", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                return `${window.location.origin}${data.url}`; // ✅ Public URL (for QR code)
            } else {
                throw new Error("Upload failed");
            }
        } catch (err) {
            console.error("Upload failed, using Blob URL fallback:", err);

            // 🔹 fallback: use Blob URL (temporary, not shareable across devices)
            return URL.createObjectURL(blob);
        }
    };

    // 🔹 Collect all logs for global filtering
    const allLogs = Object.values(groupedByEmail).flat();

    // 🔹 Apply filters
    const filteredData = Object.entries(groupedByEmail).filter(
        ([email, logs]) => {
            const fullname = `${logs[0].Firstname || ""} ${logs[0].Lastname || ""}`
                .toLowerCase()
                .trim();

            const matchSearch =
                fullname.includes(search.toLowerCase()) ||
                email.toLowerCase().includes(search.toLowerCase());

            const matchDept =
                department === "All" || logs[0].Department === department;

            return matchSearch && matchDept;
        }
    );

    const filterByDate = (logs: ActivityLog[]) => {
        const start = startDate ? new Date(startDate + "T00:00:00") : null;
        const end = endDate ? new Date(endDate + "T23:59:59") : null;

        return logs.filter((log) => {
            const logDate = new Date(log.date_created);
            return (!start || logDate >= start) && (!end || logDate <= end);
        });
    };

    const departments = [
        "All",
        ...Array.from(new Set(allLogs.map((log) => log.Department))),
    ];

    if (Object.keys(groupedByEmail).length === 0) {
        return (
            <p className="text-gray-400 text-center mt-4">No activity logs found.</p>
        );
    }

    return (
        <div>
            {/* 🔹 Filters */}
            <Filters
                search={search}
                setSearchAction={setSearch}
                department={department}
                setDepartmentAction={setDepartment}
                startDate={startDate}
                setStartDateAction={setStartDate}
                endDate={endDate}
                setEndDateAction={setEndDate}
                departments={departments}
                allLogs={allLogs}
                handleExportExcelAction={handleExportExcel}
                filterByDateAction={filterByDate}
            />

            {/* 🔹 User Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredData.map(([email, logs]) => {
                    const filteredLogs = filterByDate(logs);

                    return (
                        <div
                            key={email}
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
                                    <p className="font-semibold text-sm truncate capitalize">
                                        {logs[0].Firstname || ""} {logs[0].Lastname || ""}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{logs[0].Department}</p>
                                    <p className="text-xs text-gray-400 truncate">{email}</p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 mb-3 items-center sm:items-start">
                                <button
                                    onClick={() => setOpenModal(email)}
                                    className="bg-blue-600 text-white px-3 py-2 rounded text-xs w-full sm:w-auto hover:bg-blue-700 flex items-center gap-1 justify-center"
                                >
                                    <LuLogs size={20} />
                                    View
                                </button>
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

                            {/* Modal */}
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
                })}
            </div>
        </div>
    );
};

export default Table;
