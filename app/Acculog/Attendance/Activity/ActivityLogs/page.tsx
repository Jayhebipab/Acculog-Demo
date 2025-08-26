"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Form from "../../../components/Activity/Form";
import Table from "../../../components/Activity/Table";
import Filter from "../../../components/Activity/Filter";
import Pagination from "../../../components/Activity/Pagination";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
    ReferenceID: string;
    Email: string;
    Type: string;
    Status: string;
    _id?: string;
    Remarks: string;
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
    const [showForm, setShowForm] = useState(false);
    const [animateForm, setAnimateForm] = useState(false);
    const [form, setForm] = useState<FormData>({
        ReferenceID: "",
        Email: "",
        Type: "",
        Status: "",
        Remarks: "",
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

    const fetchAccount = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ModuleSales/Activity/FetchLog");
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

    const handleFormChange = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEdit = (log: FormData) => {
        setForm({
            ReferenceID: log.ReferenceID,
            Email: log.Email,
            Type: log.Type,
            Status: log.Status,
            _id: log._id || "",
            Remarks: log.Remarks || "",
            date_created: log.date_created || "",
        });
        openFormWithAnimation();
    };

    const filteredByReference = posts.filter((post) => {
        const matchReferenceID =
            post?.referenceid === userDetails.ReferenceID ||
            post?.ReferenceID === userDetails.ReferenceID;
        return matchReferenceID;
    });

    // After filtering, apply descending sort by date_created
    const allVisibleAccounts = userDetails.Department === "Human Resources" ? posts : filteredByReference;

    const filteredAccounts = allVisibleAccounts
        .filter((post) => {
            const search = searchQuery.toLowerCase();
            const matchesSearch =
                post.Type?.toLowerCase().includes(search) ||
                post.Status?.toLowerCase().includes(search);

            const matchesType = filterType ? post.Type === filterType : true;

            let matchesDate = true;
            if (startDate) {
                matchesDate = matchesDate && new Date(post.date_created) >= new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1); // Include full end date
                matchesDate = matchesDate && new Date(post.date_created) < end;
            }

            return matchesSearch && matchesType && matchesDate;
        })
        .sort(
            (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        );



    // Reset page to 1 on filter/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterType, startDate, endDate]);

    // Pagination calculations
    const totalItems = filteredAccounts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = filteredAccounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (page: number) => {
        if (page < 1) page = 1;
        else if (page > totalPages) page = totalPages;
        setCurrentPage(page);
    };

    useEffect(() => {
        if (userDetails.ReferenceID && userDetails.Email) {
            setForm((prev) => ({
                ...prev,
                ReferenceID: userDetails.ReferenceID,
                Email: userDetails.Email,
            }));
        }
    }, [userDetails.ReferenceID, userDetails.Email]);

    // Form animation helpers
    const openFormWithAnimation = () => {
        setShowForm(true);
        setTimeout(() => setAnimateForm(true), 10);
    };
    const closeFormWithAnimation = () => {
        setAnimateForm(false);
        setTimeout(() => setShowForm(false), 300);
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="container mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1">
                                {/* Animated form overlay */}
                                {showForm && (
                                    <div
                                        className={`fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black bg-opacity-50 transition-opacity duration-300 ${animateForm ? "opacity-100" : "opacity-0"}`}
                                    >
                                        <Form
                                            formData={form}
                                            onChange={handleFormChange}
                                            userDetails={userDetails}
                                            fetchAccount={fetchAccount}
                                            setForm={setForm}
                                            setShowForm={closeFormWithAnimation}
                                        />
                                    </div>
                                )}

                                <div className="mb-4 p-4 bg-white shadow-md rounded-lg text-gray-900">
                                    <h2 className="text-lg font-bold mb-2">Activity Logs</h2>
                                    <button onClick={openFormWithAnimation} aria-label="Add Activity" title="Add Activity" className="bg-green-700 hover:bg-green-800 text-white shadow-md mb-4 rounded p-2 text-xs whitespace-nowrap hidden sm:inline-block">Create Activity</button>
                                    <Filter
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        filterType={filterType}
                                        setFilterType={setFilterType}
                                        startDate={startDate}
                                        setStartDate={setStartDate}
                                        endDate={endDate}
                                        setEndDate={setEndDate}
                                    />
                                    {/* Table with paginated data */}
                                    <Table data={paginatedData} onEdit={handleEdit} department={userDetails.Department} />

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

                            <ToastContainer className="text-xs" autoClose={1000} />
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;
