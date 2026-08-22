import api from "./api";

import type {
    Job,
    JobFilterRequest,
} from "../types/job";

// =====================================================
// GET ALL PUBLISHED JOBS
// =====================================================

export const getPublishedJobs = async (): Promise<Job[]> => {
    const response = await api.get<Job[]>(
        "/candidate/jobs"
    );

    return response.data;
};

// =====================================================
// GET JOB BY ID
// =====================================================

export const getJobById = async (
    jobId: number
): Promise<Job> => {

    const response = await api.get<Job>(
        `/candidate/jobs/${jobId}`
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