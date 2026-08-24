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

export type SkillImportance =
    | "MUST_HAVE"
    | "IMPORTANT"
    | "NICE_TO_HAVE";

export interface JobSkill {
    name: string;
    importance: SkillImportance;
    displayOrder?: number;
}


// =====================================================
// JOB
// =====================================================

export interface Job {
    id: number;

    title: string;
    description: string;
    requirements: string;
    skills: string;
    skillRequirements?: JobSkill[];

    location: string;

    employmentType: string;
    experienceLevel: string;

    salaryMin: number;
    salaryMax: number;

    applicationDeadline: string;

    status: string;

    createdAt?: string;
    updatedAt?: string;

    companyName: string;
    companyWebsite?: string;

    // AI Matching
    matchPercentage?: number | null;

    skillCoverage?: number;
    weightedSkillScore?: number;
    overallSimilarity?: number;
    scoringMethod?: string;
    skillScoreWeight?: number;
    semanticScoreWeight?: number;

    matchedSkills?: string[];

    relatedSkills?: string[];

    candidateLanguages?: string[];

    missingSkills?: string[];

    candidateSkills?: string[];

    requiredSkills?: string[];
    skillScores?: Record<string, number>;
    skillWeights?: Record<string, number>;
    skillImportance?: Record<string, string>;
    skillEvidence?: Record<string, string>;
    skillMatchTypes?: Record<string, string>;
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

    skillRequirements: JobSkill[];

    location: string;

    employmentType: EmploymentType;

    experienceLevel: ExperienceLevel;

    salaryMin: number;

    salaryMax: number;

    applicationDeadline: string;
}

export interface JobFormState extends CreateJobRequest {
    status: JobStatus;
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

    skillRequirements?: JobSkill[];

    location?: string;

    employmentType?: EmploymentType;

    experienceLevel?: ExperienceLevel;

    salaryMin?: number;

    salaryMax?: number;

    applicationDeadline?: string;

    status?: JobStatus;
}
