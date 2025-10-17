"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

interface CameraProps {
  onCapture: (dataUrl: string) => void;
}

// Face Front Default
const MAX_YAW_DEGREE = 15; 
const COUNTDOWN_SECONDS = 2; 

const CameraWithFaceDetection: React.FC<CameraProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceValid, setFaceValid] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Face API Model
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models/face_expression");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark68");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Face‑API model loading error:", err);
      }
    };
    loadModels();
  }, []);

  // Webcam
  useEffect(() => {
    if (!modelsLoaded) return;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [modelsLoaded]);

  // Check Face Blink, Smile Etc. (Verification)
  const isBlinking = (landmarks: faceapi.FaceLandmarks68) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const calcEAR = (eye: faceapi.Point[]) => {
      const vertical1 = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
      const vertical2 = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
      const horizontal = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
      return (vertical1 + vertical2) / (2.0 * horizontal);
    };

    const leftEAR = calcEAR(leftEye);
    const rightEAR = calcEAR(rightEye);
    const avgEAR = (leftEAR + rightEAR) / 2;
    return avgEAR < 0.25;
  };

  const getApproximateYaw = (landmarks: faceapi.FaceLandmarks68) => {
    const nose = landmarks.getNose()[3];
    const leftCheek = landmarks.getJawOutline()[0];
    const rightCheek = landmarks.getJawOutline()[16];

    const totalWidth = rightCheek.x - leftCheek.x;
    const ratio = (nose.x - leftCheek.x) / totalWidth;
    return (ratio - 0.5) * 60;
  };

  // Analyze Video Frame
  const analyseFrame = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded) return;

    const detections = await faceapi
      .detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      )
      .withFaceLandmarks()
      .withFaceExpressions();

    if (detections.length === 0) {
      setFaceValid(false);
    } else {
      const detection = detections[0];
      const { expressions, landmarks } = detection;

      const isSmiling = expressions.happy > 0.6;
      const blinking = isBlinking(landmarks);
      const yawDeg = getApproximateYaw(landmarks);
      const isFacingCamera = Math.abs(yawDeg) <= MAX_YAW_DEGREE;

      setFaceValid(isFacingCamera && (isSmiling || blinking));
    }

    requestAnimationFrame(analyseFrame);
  }, [modelsLoaded]);

  // Countdown
  useEffect(() => {
    if (faceValid && !capturedImage) {
      if (countdown === null) setCountdown(COUNTDOWN_SECONDS);
    } else {
      if (countdown !== null) setCountdown(null);
    }
  }, [faceValid, capturedImage]);

  // Tick
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      capture();
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => (prev! > 0 ? prev! - 1 : 0)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Analyze Video While Playing
  const handlePlay = () => requestAnimationFrame(analyseFrame);

  // Capture
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);

    const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    onCapture(dataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {!capturedImage && (
        <div className="relative w-full max-w-xs">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onPlay={handlePlay}
            className={`w-full aspect-video rounded shadow-lg border-4 transition-colors duration-200 ${faceValid ? "border-green-500" : "border-red-500"}`}
          />

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-6xl font-bold drop-shadow-lg">{countdown}</span>
            </div>
          )}
        </div>
      )}

      {!capturedImage && (
        <p className={`mt-2 text-xs font-semibold ${faceValid ? "text-green-600" : "text-red-600"}`}>
          {faceValid
            ? countdown === null
              ? `Valid face detected – hold steady for ${COUNTDOWN_SECONDS} seconds ✅`
              : `Capturing in ${countdown}s...`
            : "Not valid: not facing camera, no blink or smile detected"}
        </p>
      )}

      {capturedImage && (
        <div className="mt-4 w-full flex flex-col items-center">
          <p className="mb-2 font-semibold">Captured Image:</p>
          <img src={capturedImage} alt="Captured" className="w-full max-w-xs rounded shadow-md" />
        </div>
      )}
    </div>
  );
};

export default CameraWithFaceDetection;
