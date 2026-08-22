import api from "./api";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from "../types/auth";

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

// =====================================================
// LOGOUT
// =====================================================

export const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
};