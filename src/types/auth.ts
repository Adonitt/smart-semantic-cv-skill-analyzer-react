export type RoleEnum =
    | "CANDIDATE"
    | "RECRUITER"
    | "ADMIN";

export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    role: RoleEnum;

    // Recruiter
    companyName?: string;
    companyWebsite?: string;
    positionTitle?: string;

    // Candidate
    headline?: string;
    industryDomain?: string;
}

export interface RegisterResponse {
    id: number;
    email: string;
    fullName: string;
    role: RoleEnum;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    id: number;
    email: string;
    fullName: string;
    role: RoleEnum;
    token: string;
    message: string;
}