"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import { FiMail, FiLock } from "react-icons/fi";
import { LuFingerprint } from "react-icons/lu";
import "react-toastify/dist/ReactToastify.css";

const Login: React.FC = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFingerprint, setLoadingFingerprint] = useState(false);
  const router = useRouter();

  const isWebAuthnSupported = () =>
    typeof window !== "undefined" &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === "function";

  // Email/password login
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

        if (response.ok && result.userId) {
          toast.success("Login successful!");
          setTimeout(() => {
            router.push(
              `/Acculog/Attendance/Dashboard?id=${encodeURIComponent(
                result.userId
              )}`
            );
          }, 800);
        } else {
          toast.error(result.message || "Login failed!");
        }
      } catch {
        toast.error("An error occurred while logging in!");
      } finally {
        setLoading(false);
      }
    },
    [Email, Password, router]
  );

  // Fingerprint login flow with WebAuthn
  const handleVerifyFingerprint = async () => {
    if (!isWebAuthnSupported()) {
      // Fallback prompt if WebAuthn unsupported
      const fallbackKey = prompt(
        "WebAuthn not supported. Enter your fingerprint key to simulate biometric login:"
      );
      if (!fallbackKey) {
        toast.error("Fingerprint key is required for login.");
        return;
      }
      try {
        setLoadingFingerprint(true);
        const response = await fetch("/api/login/fingerprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ FingerprintKey: fallbackKey }),
        });
        const result = await response.json();

        if (response.ok && result.userId) {
          toast.success("Fingerprint login successful!");
          setTimeout(() => {
            router.push(
              `/Acculog/Attendance/Dashboard?id=${encodeURIComponent(
                result.userId
              )}`
            );
          }, 800);
        } else {
          toast.error(result.message || "Fingerprint login failed!");
        }
      } catch {
        toast.error("An error occurred during fingerprint login!");
      } finally {
        setLoadingFingerprint(false);
      }
      return;
    }

    try {
      setLoadingFingerprint(true);
      toast.info("Starting fingerprint authentication...");

      // Step 1: Get challenge options from server
      const challengeResponse = await fetch("/api/login/fingerprint/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email }),
      });

      if (!challengeResponse.ok) {
        const err = await challengeResponse.json();
        toast.error(err.message || "Failed to get challenge");
        setLoadingFingerprint(false);
        return;
      }

      const options = await challengeResponse.json();

      // Transform challenge and allowCredentials data to Uint8Array as required by WebAuthn
      options.challenge = Uint8Array.from(atob(options.challenge), (c) =>
        c.charCodeAt(0)
      );

      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map(
          (cred: any) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), (c) => c.charCodeAt(0)),
          })
        );
      }

      // Step 2: Call WebAuthn API
      const assertion = (await navigator.credentials.get({
        publicKey: options,
      })) as PublicKeyCredential;

      if (!assertion) {
        toast.error("Authentication was cancelled or failed");
        setLoadingFingerprint(false);
        return;
      }

      // Prepare data to send to server
      const authData = {
        id: assertion.id,
        rawId: bufferToBase64Url(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: bufferToBase64Url(
            (assertion.response as AuthenticatorAssertionResponse).authenticatorData
          ),
          clientDataJSON: bufferToBase64Url(
            (assertion.response as AuthenticatorAssertionResponse).clientDataJSON
          ),
          signature: bufferToBase64Url(
            (assertion.response as AuthenticatorAssertionResponse).signature
          ),
          userHandle: (assertion.response as AuthenticatorAssertionResponse).userHandle
            ? bufferToBase64Url(
              (assertion.response as AuthenticatorAssertionResponse).userHandle!
            )
            : null,
        },
      };


      // Step 3: Verify assertion with server
      const verifyResponse = await fetch("/api/login/fingerprint/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authData, Email }),
      });

      const verifyResult = await verifyResponse.json();

      if (verifyResponse.ok && verifyResult.userId) {
        toast.success("Fingerprint login successful!");
        setTimeout(() => {
          router.push(
            `/Acculog/Attendance/Dashboard?id=${encodeURIComponent(
              verifyResult.userId
            )}`
          );
        }, 800);
      } else {
        toast.error(verifyResult.message || "Fingerprint login failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during fingerprint login!");
    } finally {
      setLoadingFingerprint(false);
    }
  };

  // Helper to convert ArrayBuffer to base64url string
  function bufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (const b of bytes) {
      binary += String.fromCharCode(b);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <ToastContainer className="text-xs" />

      <div className="relative z-10 w-full max-w-md p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Image
            src="/acculog.png"
            alt="Acculog Logo"
            width={220}
            height={60}
            className="mb-3 rounded-md"
          />
          <p className="text-xs text-gray-500 font-medium">
            Time & Attendance Tracking
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-200">
            <FiMail className="text-cyan-600" />
            <input
              type="email"
              placeholder="Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
              disabled={loading || loadingFingerprint}
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-200">
            <FiLock className="text-cyan-600" />
            <input
              type="password"
              placeholder="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
              disabled={loading || loadingFingerprint}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loadingFingerprint}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm rounded-lg transition-all duration-300 shadow-md hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Fingerprint Login */}
        <button
          type="button"
          onClick={handleVerifyFingerprint}
          disabled={loading || loadingFingerprint}
          className="mt-3 w-full py-3 border border-cyan-400 text-cyan-600 font-medium text-sm rounded-lg hover:bg-cyan-50 transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loadingFingerprint ? (
            "Verifying..."
          ) : (
            <>
              <LuFingerprint size={16} /> Sign In with Fingerprint
            </>
          )}
        </button>

        {/* Footer */}
        <p className="mt-4 text-[10px] text-center text-gray-400 font-medium">
          Acculog © {new Date().getFullYear()} | Attendance & Time Tracking System
        </p>
      </div>
    </div>
  );
};

export default Login;
