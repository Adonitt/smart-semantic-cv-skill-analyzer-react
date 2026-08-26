import type {
    EmploymentType,
} from "./job";

export type RoleEnum =
    | "CANDIDATE"
    | "RECRUITER"
    | "ADMIN";

export interface CandidateProfile {
    id: number;
    headline?: string | null;
    industryDomain?: string | null;
    cvFilePath?: string | null;
}

export interface RecruiterProfile {
    id: number;
    companyName: string;
    companyWebsite?: string | null;
    positionTitle?: string | null;
}

export interface RecruiterProfileUpdateRequest {
    companyName: string;
    companyWebsite: string;
    positionTitle: string;
}

export interface UserDetails {
    id: number;
    email: string;
    fullName: string;
    role: RoleEnum;
    emailVerified: boolean;
    createdAt: string;

    candidateProfile?: CandidateProfile | null;
    recruiterProfile?: RecruiterProfile | null;
}

export interface UserList {
    id: number;
    fullName: string;
    email: string;
    role: RoleEnum;
    emailVerified: boolean;
    createdAt: string;
}

export interface UpdateUserRequest {
    fullName: string;
    email: string;
    role?: RoleEnum;
    headline?: string;
    industryDomain?: string;
    companyName?: string;
    companyWebsite?: string;
    positionTitle?: string;
}

export interface UserPage {
    content: UserList[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}
