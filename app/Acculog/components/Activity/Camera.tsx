"use client";

import React, { useEffect, useRef, useState } from "react";
import { LuFlipHorizontal } from "react-icons/lu";

interface CameraProps {
  onCapture: (dataUrl: string) => void;
}

// Count Down
const COUNTDOWN_SECONDS = 4;

const CameraCaptureOnTap: React.FC<CameraProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  
  // Start Camera when click
  const startCamera = (deviceId?: string) => {
    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });
  };

  // Get camera devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((allDevices) => {
      const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    });
  }, []);

  // Start/restart camera when device changes
  useEffect(() => {
    if (!selectedDeviceId) return;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    startCamera(selectedDeviceId);
  }, [selectedDeviceId]);

  const flipCamera = () => {
    if (devices.length < 2) return; // nothing to flip
    const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  };
  
  // Tap Function
  const handleTap = () => {
    if (capturedImage) return;
    if (countdown === null) {
      setCountdown(COUNTDOWN_SECONDS);
    }
  };
  
  // Fetch
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      capture();
      return;
    }
    const timer = setTimeout(
      () => setCountdown((prev) => (prev! > 0 ? prev! - 1 : 0)),
      1000
    );
    return () => clearTimeout(timer);
  }, [countdown]);
  
  // Capture Images
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);

    setCapturedImage(dataUrl);
    onCapture(dataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };
  
  // Retake Photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setCountdown(null);
    if (selectedDeviceId) startCamera(selectedDeviceId);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Camera selector */}
      {!capturedImage && devices.length > 0 && (
        <select
          value={selectedDeviceId || ""}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="mb-2 border px-2 py-1 rounded"
        >
          {devices.map((d, idx) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${idx + 1}`}
            </option>
          ))}
        </select>
      )}

      {!capturedImage && (
        <div
          className="relative w-full max-w-xs cursor-pointer"
          onClick={handleTap}
          onTouchStart={handleTap}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video shadow-lg border-2 border-green-700 rounded-lg"
          />

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-white text-6xl font-bold drop-shadow-lg">{countdown}</span>
            </div>
          )}

          {countdown === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-white text-sm font-semibold text-center px-2">
                Tap anywhere to take photo
              </span>
            </div>
          )}
        </div>
      )}

      {!capturedImage && devices.length > 1 && (
        <button
          type="button"
          onClick={flipCamera}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2"
        >
          <LuFlipHorizontal size={20} />
          <span>Flip Camera</span>
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {capturedImage && (
        <div className="mt-4 w-full flex flex-col items-center">
          <p className="mb-2 font-semibold">Captured Image:</p>
          <img src={capturedImage} alt="Captured" className="w-full max-w-xs rounded shadow-md" />
          <button
            onClick={retakePhoto}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Retake Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCaptureOnTap;
