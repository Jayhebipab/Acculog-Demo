"use client";

import React, { useState, useEffect } from "react";
// Root
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
// Route
import Developers from "../../../components/Account/Developer/Info";
// Toast Notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage: React.FC = () => {
    const [userDetails, setUserDetails] = useState({ id: "", Firstname: "", Lastname: "", Email: "", Role: "", });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch User Information
    useEffect(() => {
        const fetchUserData = async () => {
            const params = new URLSearchParams(window.location.search);
            const userId = params.get("id");

            if (userId) {
                try {
                    const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
                    if (!response.ok) throw new Error("Failed to fetch user data");
                    const data = await response.json();
                    setUserDetails({
                        id: data._id,
                        Firstname: data.Firstname || "",
                        Lastname: data.Lastname || "",
                        Email: data.Email || "",
                        Role: data.Role || "",
                    });
                } catch (err: unknown) {
                    console.error("Error fetching user data:", err);
                    setError("Failed to load user data. Please try again later.");
                } finally {
                    setLoading(false);
                }
            } else {
                setError("User ID is missing.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <SessionChecker>
            <ParentLayout>
                <div className="container mx-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-1">
                        <h1 className="text-lg font-bold mb-4">Developers Team</h1>
                        {error && <div className="text-red-500 mb-4">{error}</div>}
                        {/* Developer Form */}
                        <Developers />
                    </div>
                </div>
                <ToastContainer />
            </ParentLayout>
        </SessionChecker>
    );
};

export default ProfilePage;
