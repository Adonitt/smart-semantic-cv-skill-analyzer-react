import api from "./api";
import type { UserDetails } from "../types/user";

// =====================================================
// GET LOGGED-IN USER PROFILE
// =====================================================

export const getMyProfile = async (): Promise<UserDetails> => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        throw new Error("User ID not found.");
    }

    const response = await api.get<UserDetails>(
        `/users/${userId}`
    );

    return response.data;
};