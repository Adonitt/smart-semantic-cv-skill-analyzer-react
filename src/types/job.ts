// =====================================================
// EMPLOYMENT TYPE
// =====================================================

export type EmploymentType =
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACT"
    | "INTERNSHIP";


// =====================================================
// EXPERIENCE LEVEL
// =====================================================

export type ExperienceLevel =
    | "ENTRY_LEVEL"
    | "MID_LEVEL"
    | "SENIOR_LEVEL";


// =====================================================
// JOB STATUS
// =====================================================

export type JobStatus =
    | "DRAFT"
    | "PUBLISHED"
    | "CLOSED";


// =====================================================
// JOB
// =====================================================

export interface Job {
    id: number;

    title: string;
    description: string;
    requirements: string;
    skills: string;

    location: string;

    employmentType: string;
    experienceLevel: string;

    salaryMin: number;
    salaryMax: number;

    applicationDeadline: string;

    status: string;

    companyName: string;
    companyWebsite?: string;

    // AI Matching
    matchPercentage?: number | null;

    matchedSkills?: string[];

    missingSkills?: string[];

    candidateSkills?: string[];
}


// =====================================================
// JOB FILTER
// Matches JobFilterRequestDto in Spring Boot
// =====================================================

export interface JobFilterRequest {

    // Search keyword
    keyword?: string;

    // Job location
    location?: string;

    // Employment type
    employmentType?: EmploymentType;

    // Experience level
    experienceLevel?: ExperienceLevel;

    // Salary range
    minSalary?: number;

    maxSalary?: number;

    // Sorting
    // MATCH = highest AI match first
    // SALARY = highest salary first
    sortBy?: "MATCH" | "SALARY";
}


// =====================================================
// CREATE JOB
// Matches CreateJobRequestDto
// =====================================================

export interface CreateJobRequest {

    title: string;

    description: string;

    requirements: string;

    skills: string;

    location: string;

    employmentType: EmploymentType;

    experienceLevel: ExperienceLevel;

    salaryMin: number;

    salaryMax: number;

    applicationDeadline: string;
}


// =====================================================
// UPDATE JOB
// Matches UpdateJobRequestDto
// =====================================================

export interface UpdateJobRequest {

    title?: string;

    description?: string;

    requirements?: string;

    skills?: string;

    location?: string;

    employmentType?: EmploymentType;

    experienceLevel?: ExperienceLevel;

    salaryMin?: number;

    salaryMax?: number;

    applicationDeadline?: string;
}