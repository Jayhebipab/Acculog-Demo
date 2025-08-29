"use client";

import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRModalProps {
    isOpen: boolean;
    qrData: string | null;
    loading: boolean;
    onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, qrData, loading, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative flex flex-col items-center">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                    ✕
                </button>

                <h3 className="text-md font-semibold mb-4">Scan to Download Excel</h3>

                {loading ? (
                    <p className="text-gray-500">Generating QR code...</p>
                ) : qrData ? (
                    <div className="p-4 bg-white">
                        <QRCodeCanvas value={qrData} size={200} />
                    </div>
                ) : (
                    <p className="text-red-500">Failed to generate QR code.</p>
                )}
            </div>
        </div>
    );
};

export default QRModal;
