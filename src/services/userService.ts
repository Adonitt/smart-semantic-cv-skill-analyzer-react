import api from "./api";
import type {
    RecruiterProfile,
    RecruiterProfileUpdateRequest,
    UpdateUserRequest,
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

export const updateMyAccount = async (
    data: UpdateUserRequest
): Promise<UpdateUserRequest> => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        throw new Error("User ID not found.");
    }

    const response = await api.put<UpdateUserRequest>(
        `/users/edit/${userId}`,
        data
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
