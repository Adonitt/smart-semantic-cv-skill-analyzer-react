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

export interface UserDetails {
    id: number;
    email: string;
    fullName: string;
    role: RoleEnum;
    createdAt: string;

    candidateProfile?: CandidateProfile | null;
    recruiterProfile?: RecruiterProfile | null;
}