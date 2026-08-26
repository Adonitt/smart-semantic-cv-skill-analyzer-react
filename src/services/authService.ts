import axios from "axios";
import api from "./api";
import type {
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
} from "../types/auth";

export const AUTH_CHANGED_EVENT = "auth-changed";

export const registerUser = async (
    data: RegisterRequest
): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(
        "/auth/register",
        data
    );

    return response.data;
};

export const loginUser = async (
    data: LoginRequest
): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
        "/auth/login",
        data
    );

    return response.data;
};

export const changePassword = async (
    data: ChangePasswordRequest
): Promise<string> => {
    const response = await api.put<string>(
        "/auth/change-password",
        data
    );

    return response.data;
};

export const forgotPassword = async (
    data: ForgotPasswordRequest
): Promise<string> => {
    const response = await api.post<string>(
        "/auth/forgot-password",
        data
    );

    return response.data;
};

export const resetPassword = async (
    data: ResetPasswordRequest
): Promise<string> => {
    const response = await api.post<string>(
        "/auth/reset-password",
        data
    );

    return response.data;
};

export const verifyEmail = async (token: string): Promise<string> => {
    const response = await api.get<string>(
        "/auth/verify-email",
        { params: { token } }
    );

    return response.data;
};

export const resendVerification = async (email: string): Promise<string> => {
    const response = await api.post<string>(
        "/auth/resend-verification",
        { email }
    );

    return response.data;
};

export const getAuthErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const responseData = error.response?.data as
        | { message?: string }
        | string
        | undefined;

    if (typeof responseData === "string" && responseData.trim()) {
        return responseData;
    }

    if (responseData && typeof responseData === "object") {
        return responseData.message || fallback;
    }

    return fallback;
};

// =====================================================
// SAVE LOGIN DATA
// =====================================================

export const saveLoginData = (
    data: LoginResponse
): void => {
    localStorage.setItem(
        "token",
        data.token
    );

    localStorage.setItem(
        "userId",
        String(data.id)
    );

    localStorage.setItem(
        "email",
        data.email
    );

    localStorage.setItem(
        "fullName",
        data.fullName
    );

    localStorage.setItem(
        "role",
        data.role
    );

    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

// =====================================================
// GET TOKEN
// =====================================================

export const getToken = (): string | null => {
    return localStorage.getItem("token");
};

// =====================================================
// GET ROLE
// =====================================================

export const getRole = (): string | null => {
    return localStorage.getItem("role");
};

export const getRoleHomePath = (role: string | null): string => {
    if (role === "CANDIDATE") return "/candidate/dashboard";
    if (role === "RECRUITER") return "/recruiter/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/login";
};

// =====================================================
// LOGOUT
// =====================================================

export const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");

    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};
