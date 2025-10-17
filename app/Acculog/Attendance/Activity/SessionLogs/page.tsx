"use client";

import React, { useState, useEffect } from "react";
// Root
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
// Fetch
import UserFetcher from "../../../components/User/UserFetcher";
// Routes
import SessionTable from "../../../components/Logs/Table";
import Filter from "../../../components/Logs/Filter";
import Pagination from "../../../components/Activity/Pagination";
// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
    ReferenceID: string;
    Email: string;
    Type: string;
    Status: string;
    _id?: string;
    date_created?: string;
}

const ListofUser: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [userDetails, setUserDetails] = useState({
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
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Fetch User Information
    useEffect(() => {
        const fetchUserData = async () => {
            const params = new URLSearchParams(window.location.search);
            const userId = params.get("id");

            if (!userId) {
                setError("User ID is missing.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
                if (!res.ok) throw new Error("Failed to fetch user data");
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
                });
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);


    // Fetch Function
    const fetchAccount = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ModuleSales/Session/FetchLog");
            const data = await res.json();
            setPosts(data.data);
        } catch (error) {
            toast.error("Error fetching activity logs.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);

    // Filter by Email
    const filteredByReference = posts.filter((post) => {
        const matchReferenceID =
            post?.email === userDetails.Email ||
            post?.Email === userDetails.Email;
        return matchReferenceID;
    });
    
    // Filter By Date Range
    const filteredAccounts = filteredByReference
        .filter((post) => {
            let matchesDate = true;
            if (startDate) {
                matchesDate = matchesDate && new Date(post.timestamp) >= new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1);
                matchesDate = matchesDate && new Date(post.timestamp) < end;
            }

            return matchesDate;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterType, startDate, endDate]);

    const totalItems = filteredAccounts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = filteredAccounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Pagination
    const goToPage = (page: number) => {
        if (page < 1) page = 1;
        else if (page > totalPages) page = totalPages;
        setCurrentPage(page);
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="container mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1">
                                <div className="mb-4 p-4 bg-white shadow-md rounded-lg text-gray-900">
                                    <h2 className="text-lg font-bold mb-2">Session Logs</h2>
                                    {/* Filter */}
                                    <Filter
                                        startDate={startDate}
                                        setStartDate={setStartDate}
                                        endDate={endDate}
                                        setEndDate={setEndDate}
                                    />

                                    {/* Table */}
                                    <SessionTable data={paginatedData} />

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        setItemsPerPage={(value) => {
                                            setItemsPerPage(value);
                                            setCurrentPage(1);
                                        }}
                                        goToPage={goToPage}
                                    />
                                </div>
                            </div>

                            {/* Toast */}
                            <ToastContainer className="text-xs" autoClose={1000} />
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;
