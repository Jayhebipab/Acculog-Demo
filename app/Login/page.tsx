"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login: React.FC = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!Email || !Password) {
        toast.error("Email and Password are required!");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Email, Password }),
        });

        const result = await response.json();

        if (response.ok) {
          if (!result.userId) {
            toast.error("No user ID received from server");
            setLoading(false);
            return;
          }

          toast.success("Login successful!");
          setTimeout(() => {
            router.push(`/Acculog/Attendance/Dashboard?id=${encodeURIComponent(result.userId)}`);
          }, 1000);
        } else {
          toast.error(result.message || "Login failed!");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("An error occurred while logging in!");
      } finally {
        setLoading(false);
      }
    },
    [Email, Password, router]
  );

  // ✅ Biometric login logic (WebAuthn)
  const handleBiometricLogin = async () => {
    try {
      if (!window.PublicKeyCredential) {
        toast.error("WebAuthn not supported.");
        return;
      }

      const challenge = new Uint8Array(32); // This should ideally come from the backend
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: "preferred",
      };

      const credential = await navigator.credentials.get({ publicKey });

      if (credential && credential.type === "public-key") {
        // Example: hardcoded biometric-associated email
        const biometricEmail = "biometric@example.com"; // Replace with mapping in production

        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Email: biometricEmail, Password: "biometric" }),
        });

        const result = await response.json();

        if (response.ok && result.userId) {
          toast.success("Biometric login successful!");
          router.push(`/Acculog/Attendance/Dashboard?id=${encodeURIComponent(result.userId)}`);
        } else {
          toast.error("Biometric login failed.");
        }
      } else {
        toast.error("Biometric authentication failed.");
      }
    } catch (error) {
      console.error("Biometric login error:", error);
      toast.error("An error occurred with biometric login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#00ffcc33_1px,transparent_1px)] bg-[size:40px_40px] z-0" />
      <ToastContainer className="text-xs" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white backdrop-blur-lg rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6 text-center">
          <Image src="/acculog.png" alt="Pantsin" width={400} height={100} className="mb-4 rounded-md" />
          <p className="text-xs mt-2 max-w-sm text-black font-bold">Please use the given username and password to access the system.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border-b text-xs text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border-b text-xs text-black"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 hover:scale-[1.02] text-white font-semibold text-xs rounded-lg transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* ✅ Biometrics Button */}
        <button
          onClick={handleBiometricLogin}
          className="mt-4 w-full py-3 bg-green-600 hover:bg-green-500 hover:scale-[1.02] text-white font-semibold text-xs rounded-lg transition-all duration-300 shadow-md"
        >
          Login with Biometrics
        </button>

        <p className="mt-4 text-xs text-center font-bold">Acculog - Attendance and Time Tracking System | IT Department</p>
      </div>
    </div>
  );
};

export default Login;
