"use client";

import React, { useState } from "react";
// Icons
import { LuArrowBigLeft, LuArrowBigRight } from 'react-icons/lu';

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

interface CalendarModalProps {
    isOpen: boolean;
    logs: ActivityLog[];
    onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, logs, onClose }) => {
    if (!isOpen) return null;

    const [currentDate, setCurrentDate] = useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Group By Date
    const grouped = logs.reduce((acc, log) => {
        const day = new Date(log.date_created).toISOString().split("T")[0];
        if (!acc[day]) acc[day] = [];
        acc[day].push(log);
        return acc;
    }, {} as Record<string, ActivityLog[]>);

    // Get Days of Month
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
        i < firstDay ? null : i - firstDay + 1
    );

    // Names of Month
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal Panel */}
            <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full z-10">
                {/* Header with navigation */}
                <div className="text-lg font-bold mb-4 flex justify-between items-center">
                    <button
                        onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    >
                        <LuArrowBigLeft size={30} />
                    </button>
                    {monthNames[month]} {year}
                    <button
                        onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    >
                        <LuArrowBigRight size={30} />
                    </button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center font-semibold text-sm mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d}>{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center">
                    {daysArray.map((day, idx) => {
                        if (!day) return <div key={idx}></div>;

                        const dateKey = new Date(year, month, day).toISOString().split("T")[0];
                        const dayLogs = grouped[dateKey] || [];

                        return (
                            <div
                                key={idx}
                                className="border rounded-md h-20 flex flex-col items-center justify-start p-1 text-xs overflow-hidden"
                            >
                                <span className="font-bold">{day}</span>
                                <div className="flex flex-wrap gap-1 mt-1 overflow-hidden">
                                    {dayLogs.map((log, i) => (
                                        <span
                                            key={i}
                                            className={`w-3 h-3 rounded-full inline-block ${log.Status.toLowerCase() === "login"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-4 border-t pt-3 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                        <span>Login</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                        <span>Logout</span>
                    </div>
                </div>

                {/* Close Button */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;
