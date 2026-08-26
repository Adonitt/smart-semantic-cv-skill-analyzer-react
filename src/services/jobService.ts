import api from "./api";

import type {
    CreateJobRequest,
    AdminJob,
    AdminJobPage,
    Job,
    JobPage,
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
    const response = await getMyJobsPage({ page: 0, size: 100 });
    return response.content;
};

export const getMyJobsPage = async (params: {
    page: number;
    size: number;
    status?: "DRAFT" | "PUBLISHED" | "CLOSED";
}): Promise<JobPage> => {
    const response = await api.get<JobPage>("/recruiter/jobs", {
        params: {
            page: params.page,
            size: params.size,
            ...(params.status ? { status: params.status } : {}),
        },
    });

    return response.data;
};

// =====================================================
// ADMIN - ALL JOBS
// =====================================================

export const getAdminJobs = async (): Promise<AdminJob[]> => {
    const response = await api.get<AdminJobPage>("/admin/jobs", {
        params: { page: 0, size: 100 },
    });
    return response.data.content;
};

export const getAdminJobsPage = async (params: {
    page: number;
    size: number;
    search?: string;
    status?: "DRAFT" | "PUBLISHED" | "CLOSED";
}): Promise<AdminJobPage> => {
    const response = await api.get<AdminJobPage>("/admin/jobs", {
        params: {
            page: params.page,
            size: params.size,
            ...(params.search ? { search: params.search } : {}),
            ...(params.status ? { status: params.status } : {}),
        },
    });

    return response.data;
};

export const updateAdminJobStatus = async (
    jobId: number,
    status: "DRAFT" | "PUBLISHED" | "CLOSED"
): Promise<AdminJob> => {
    const response = await api.patch<AdminJob>(
        `/admin/jobs/${jobId}/status`,
        null,
        { params: { status } }
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
