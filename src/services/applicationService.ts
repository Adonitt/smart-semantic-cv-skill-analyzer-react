import api from "./api";

import type {
    Application,
    ApplyToJobRequest,
    ApplicationStatus,
} from "../types/application";


// =====================================================
// CANDIDATE - APPLY TO JOB
// =====================================================

export const applyToJob = async (
    jobId: number,
    data: ApplyToJobRequest
): Promise<Application> => {

    const response = await api.post<Application>(
        `/candidate/jobs/${jobId}/apply`,
        data
    );

    return response.data;
};


// =====================================================
// CANDIDATE - MY APPLICATIONS
// =====================================================

export const getMyApplications = async (): Promise<Application[]> => {

    const response = await api.get<Application[]>(
        "/candidate/applications"
    );

    return response.data;
};


// =====================================================
// RECRUITER - APPLICATIONS FOR JOB
// =====================================================

export const getApplicationsForJob = async (
    jobId: number
): Promise<Application[]> => {

    const response = await api.get<Application[]>(
        `/recruiter/jobs/${jobId}/applications`
    );

    return response.data;
};


// =====================================================
// RECRUITER - UPDATE APPLICATION STATUS
// =====================================================

export const updateApplicationStatus = async (
    applicationId: number,
    status: ApplicationStatus
): Promise<void> => {

    await api.put(
        `/recruiter/applications/${applicationId}/status`,
        null,
        {
            params: {
                status,
            },
        }
    );
};


// =====================================================
// RECRUITER - APPLICATIONS + CANDIDATE DETAILS
// =====================================================

export const getApplicationsWithCandidate = async (
    jobId: number
): Promise<Application[]> => {

    const response = await api.get<Application[]>(
        `/recruiter/jobs/${jobId}/applications/details`
    );

    return response.data;
};
