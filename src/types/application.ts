export type ApplicationStatus =
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED";

export interface Application {
    id: number;

    jobId: number;
    jobTitle: string;

    candidateProfileId: number;

    candidateFullName: string;
    candidateEmail: string;

    headline?: string | null;
    industryDomain?: string | null;

    cvFilePath?: string | null;

    status: ApplicationStatus;

    coverLetter?: string | null;

    appliedAt: string;

    matchPercentage?: number | null;

    matchedSkills?: string[] | null;
    missingSkills?: string[] | null;
}

export interface ApplyToJobRequest {
    coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
    status: ApplicationStatus;
}