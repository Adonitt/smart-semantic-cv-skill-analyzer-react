import api from "./api";
import type {
    RecruiterProfile,
    RecruiterProfileUpdateRequest,
    UserDetails,
} from "../types/user";

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

export const updateRecruiterProfile = async (
    data: RecruiterProfileUpdateRequest
): Promise<RecruiterProfile> => {
    const response = await api.put<RecruiterProfile>(
        "/recruiter/profile",
        data
    );

    return response.data;
};
