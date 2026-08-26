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
    jobDetails?: ApplicationJobDetails | null;

    candidateProfileId: number;

    candidateFullName: string;
    candidateEmail: string;

    headline?: string | null;
    industryDomain?: string | null;

    cvFilePath?: string | null;
    cvSnapshotAvailable?: boolean;
    cvOriginalFilename?: string | null;

    status: ApplicationStatus;

    coverLetter?: string | null;

    appliedAt: string;

    matchPercentage?: number | null;

    candidateSkills?: string[] | null;
    candidateLanguages?: string[] | null;
    requiredSkills?: string[] | null;
    skillCoverage?: number | null;
    weightedSkillScore?: number | null;
    overallSimilarity?: number | null;
    scoringMethod?: string | null;
    skillScoreWeight?: number | null;
    semanticScoreWeight?: number | null;

    matchedSkills?: string[] | null;
    relatedSkills?: string[] | null;
    missingSkills?: string[] | null;
    skillScores?: Record<string, number> | null;
    skillWeights?: Record<string, number> | null;
    skillImportance?: Record<string, string> | null;
    skillEvidence?: Record<string, string> | null;
    skillMatchTypes?: Record<string, string> | null;
}

export interface ApplicationPage {
    content: Application[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface ApplicationJobDetails {
    id: number;
    title: string;
    description?: string | null;
    requirements?: string | null;
    skills?: string | null;
    skillRequirements?: {
        name: string;
        importance: string;
        displayOrder?: number;
    }[] | null;
    location?: string | null;
    employmentType?: string | null;
    experienceLevel?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    applicationDeadline?: string | null;
    status?: string | null;
    companyName?: string | null;
    companyWebsite?: string | null;
}

export interface ApplyToJobRequest {
    coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
    status: ApplicationStatus;
}
