"use client";
import React from "react";
import { toast } from "react-toastify";
import { Logout } from "../services/logoutservice";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await Logout();
            if (response.status) {
                toast.success("Logged out successfully", { position: "top-right" });
                router.push("/logout"); // Changed from "/" to "/logout"
            } else {
                toast.error(response.message || "Logout failed", { position: "top-right" });
            }
        } catch (error) {
            toast.error("Logout failed", { position: "top-right" });
        }
    };

    return (
        <div>
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Logout
            </button>
        </div>
    );
}
