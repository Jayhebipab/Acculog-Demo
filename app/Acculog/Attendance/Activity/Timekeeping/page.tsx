"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Table from "../../../components/Timekeeping/Table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ActivityLog {
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

interface User {
    ReferenceID: string;
    Email: string;
    Firstname: string;
    Lastname: string;
    profilePicture?: string;
    Department: string;
}

const ListofUser: React.FC = () => {
    const [posts, setPosts] = useState<ActivityLog[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [userDetails, setUserDetails] = useState<any>({
        UserId: "",
        Firstname: "",
        Lastname: "",
        Manager: "",
        TSM: "",
        Email: "",
        Role: "",
        Department: "",
        Company: "",
        TargetQuota: "",
        ReferenceID: "",
        profilePicture: "",
    });
    const [loading, setLoading] = useState(true);
    const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

    // Fetch current user details
    useEffect(() => {
        const fetchUserData = async () => {
            const params = new URLSearchParams(window.location.search);
            const userId = params.get("id");
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
                const data = await res.json();
                setUserDetails({
                    UserId: data._id,
                    Firstname: data.Firstname || "",
                    Lastname: data.Lastname || "",
                    Email: data.Email || "",
                    Manager: data.Manager || "",
                    TSM: data.TSM || "",
                    Role: data.Role || "",
                    Department: data.Department || "",
                    Company: data.Company || "",
                    TargetQuota: data.TargetQuota || "",
                    ReferenceID: data.ReferenceID || "",
                    profilePicture: data.profilePicture || "/fluxx.png",
                });
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };
        fetchUserData();
    }, []);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/fetchuser");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast.error("Error fetching users.");
            console.error("Error Fetching", error);
        }
    };

    // Fetch activity logs
    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/ModuleSales/Activity/FetchLog");
            const data = await res.json();
            setPosts(data.data);
        } catch (err) {
            toast.error("Failed to fetch activity logs");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchLogs();
        setLoading(false);
    }, []);

    // Map posts to user info
    const postsWithUserInfo = posts.map((post) => {
        const matchedUser = users.find((u) => u.Email === post.Email);
        return {
            ...post,
            Firstname: matchedUser?.Firstname || post.Firstname || "",
            Lastname: matchedUser?.Lastname || post.Lastname || "",
            Department: matchedUser?.Department || post.Department || "",
            profilePicture: matchedUser?.profilePicture || "/fluxx.png",
        };
    });

    // Filter visible posts
    const visiblePosts =
        userDetails.Role === "Super Admin" || userDetails.Department === "Human Resources"
            ? postsWithUserInfo
            : postsWithUserInfo.filter((p) => p.ReferenceID === userDetails.ReferenceID);

    // Group by email
    const groupedByEmail: Record<string, ActivityLog[]> = {};
    visiblePosts.forEach((log) => {
        if (!groupedByEmail[log.Email]) groupedByEmail[log.Email] = [];
        groupedByEmail[log.Email].push(log);
    });

    const toggleUserLogs = (email: string) => {
        setExpandedUsers((prev) => ({ ...prev, [email]: !prev[email] }));
    };

    if (loading) return <p className="text-center py-10">Loading...</p>;

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="container mx-auto p-4 text-gray-900 space-y-4">
                            <h2 className="text-xl font-bold mb-4">Timekeeping</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                This section provides an overview of employee attendance, including login, logout, late arrivals, and overtime records.
                                Use the filters to narrow down logs by department, employee, or date range, and export detailed reports for reference.
                            </p>
                            <Table
                                groupedByEmail={groupedByEmail}
                            />
                            <ToastContainer />
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;
