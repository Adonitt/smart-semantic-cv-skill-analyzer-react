import api from "./api";

import type {
    CreateJobRequest,
    Job,
    JobFilterRequest,
    UpdateJobRequest,
} from "../types/job";

// =====================================================
// GET ALL PUBLISHED JOBS
// =====================================================

export const getPublishedJobs = async (): Promise<Job[]> => {
    const response = await api.get<Job[]>(
        "/jobs"
    );

    return response.data;
};

// =====================================================
// RECRUITER - MY JOBS
// =====================================================

export const getMyJobs = async (): Promise<Job[]> => {
    const response = await api.get<Job[]>(
        "/recruiter/jobs"
    );

    return response.data;
};

// =====================================================
// RECRUITER - MY JOB BY ID
// =====================================================

export const getMyJobById = async (jobId: number): Promise<Job> => {
    const response = await api.get<Job>(
        `/recruiter/jobs/${jobId}`
    );

    return response.data;
};

// =====================================================
// RECRUITER - CREATE JOB
// =====================================================

export const createJob = async (data: CreateJobRequest): Promise<Job> => {
    const response = await api.post<Job>(
        "/recruiter/jobs",
        data
    );

    return response.data;
};

// =====================================================
// RECRUITER - UPDATE JOB
// =====================================================

export const updateJob = async (
    jobId: number,
    data: UpdateJobRequest
): Promise<Job> => {
    const response = await api.put<Job>(
        `/recruiter/jobs/${jobId}`,
        data
    );

    return response.data;
};

// =====================================================
// RECRUITER - DELETE JOB
// =====================================================

export const deleteJob = async (jobId: number): Promise<void> => {
    await api.delete(`/recruiter/jobs/${jobId}`);
};

// =====================================================
// RECRUITER - PUBLISH/CLOSE JOB
// =====================================================

export const publishJob = async (jobId: number): Promise<void> => {
    await api.post(`/jobs/${jobId}/publish`);
};

export const closeJob = async (jobId: number): Promise<void> => {
    await api.post(`/jobs/${jobId}/close`);
};

// =====================================================
// GET JOB BY ID
// =====================================================

export const getJobById = async (
    jobId: number
): Promise<Job> => {

    const response = await api.get<Job>(
        `/jobs/${jobId}`
    );

    return response.data;
};

// =====================================================
// FILTER JOBS
// =====================================================

export const filterJobs = async (
    filters: JobFilterRequest
): Promise<Job[]> => {

    const params: Record<string, string | number> = {};

    if (filters.keyword) {
        params.keyword = filters.keyword;
    }

    if (filters.location) {
        params.location = filters.location;
    }

    if (filters.employmentType) {
        params.employmentType = filters.employmentType;
    }

    if (filters.experienceLevel) {
        params.experienceLevel = filters.experienceLevel;
    }

    if (filters.minSalary !== undefined) {
        params.minSalary = filters.minSalary;
    }

    if (filters.maxSalary !== undefined) {
        params.maxSalary = filters.maxSalary;
    }

    if (filters.sortBy) {
        params.sortBy = filters.sortBy;
    }

    const response = await api.get<Job[]>(
        "/candidate/jobs/filter",
        {
            params,
        }
    );

    return response.data;
};
