export type ApplicationStatus =
    | "PENDING"
    | "REVIEWING"
    | "SHORTLISTED"
    | "ACCEPTED"
    | "REJECTED";

export interface Application {
    id: number;

    jobId: number;
    jobTitle: string;
    companyName?: string | null;

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
    relatedSkills?: string[] | null;
    missingSkills?: string[] | null;
    skillScores?: Record<string, number> | null;
    skillWeights?: Record<string, number> | null;
    skillImportance?: Record<string, string> | null;
    skillEvidence?: Record<string, string> | null;
    skillMatchTypes?: Record<string, string> | null;
}

export interface ApplyToJobRequest {
    coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
    status: ApplicationStatus;
}
