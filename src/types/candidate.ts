export interface CandidateProfile {
    id: number;

    headline?: string | null;

    industryDomain?: string | null;

    cvFilePath?: string | null;

    extractedRawText?: string | null;
}


export interface CandidateDetails {
    id: number;

    email: string;

    fullName: string;

    role: "CANDIDATE";

    candidateProfile?: CandidateProfile;
}