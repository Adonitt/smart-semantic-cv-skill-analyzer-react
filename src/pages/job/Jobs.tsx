import React, { useEffect, useState } from "react";
import JobCard from "../../components/JobCard";
import {
    getPublishedJobs,
    filterJobs,
} from "../../services/jobService";
import type {
    Job,
    JobFilterRequest,
} from "../../types/job";
import JobDetails from "./JobDetails";
import api from "../../services/api";

const JOBS_PER_PAGE = 9;

const Jobs: React.FC = () => {

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const [currentPage, setCurrentPage] = useState(1);

    // IDs of jobs where current candidate already applied
    const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

    const [filters, setFilters] =
        useState<JobFilterRequest>({
            keyword: "",
            location: "",
            employmentType: undefined,
            experienceLevel: undefined,
            minSalary: undefined,
            maxSalary: undefined,
            sortBy: "MATCH",
        });

    const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
    const firstJobIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const visibleJobs = jobs.slice(
        firstJobIndex,
        firstJobIndex + JOBS_PER_PAGE
    );

    // Keep the selected page valid when a filter reduces the result count.
    // The initial request should use the default filter snapshot only. Later
    // requests are explicit through submit/reset, so this effect intentionally
    // runs once rather than every time a filter field changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (totalPages === 0) {
            setCurrentPage(1);
        } else if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);


    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    const loadApplications = async () => {

        try {

            const response = await api.get(
                "/jobs/candidate/applications"
            );

            /*
             * Expected response example:
             *
             * [
             *   {
             *      id: 1,
             *      jobId: 5,
             *      ...
             *   }
             * ]
             *
             * If your backend uses another field name,
             * change jobId below.
             */

            const ids = response.data.map(
                (application: any) => application.jobId
            );

            setAppliedJobIds(ids);

        } catch (err) {

            console.error(
                "Failed to load applications:",
                err
            );

        }
    };


    // =====================================================
    // LOAD JOBS
    // =====================================================

    const loadJobs = async () => {

        try {

            setLoading(true);
            setError("");

            const hasFilters =
                filters.keyword ||
                filters.location ||
                filters.employmentType ||
                filters.experienceLevel ||
                filters.minSalary !== undefined ||
                filters.maxSalary !== undefined ||
                filters.sortBy !== "MATCH";

            const data = hasFilters
                ? await filterJobs(filters)
                : await getPublishedJobs();

            setJobs(data);
            setCurrentPage(1);

        } catch (err) {

            console.error(err);

            setError(
                "Failed to load jobs. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            await Promise.all([
                loadJobs(),
                loadApplications(),
            ]);

        };

        loadData();

    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    // =====================================================
    // FILTER CHANGE
    // =====================================================

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {

        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,

            [name]:
                value === ""
                    ? undefined
                    : name === "minSalary" ||
                    name === "maxSalary"
                        ? Number(value)
                        : value,
        }));

    };


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSubmit = (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setCurrentPage(1);
        loadJobs();

    };


    // =====================================================
    // RESET
    // =====================================================

    const resetFilters = async () => {

        const defaultFilters: JobFilterRequest = {
            keyword: "",
            location: "",
            employmentType: undefined,
            experienceLevel: undefined,
            minSalary: undefined,
            maxSalary: undefined,
            sortBy: "MATCH",
        };

        setFilters(defaultFilters);
        setCurrentPage(1);

        try {

            setLoading(true);
            setError("");

            const data =
                await getPublishedJobs();

            setJobs(data);

        } catch (err) {

            console.error(err);

            setError(
                "Failed to load jobs."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // APPLICATION SUCCESS
    // =====================================================

    const handleApplicationSuccess = (
        jobId: number
    ) => {

        setAppliedJobIds((prev) => {

            if (prev.includes(jobId)) {
                return prev;
            }

            return [...prev, jobId];

        });

    };


    // =====================================================
    // PAGE
    // =====================================================

    return (
        <main className="jobs-page">
        <div className="container jobs-container">

            {/* HEADER */}

            <div className="jobs-page-header">

                <div>
                    <span className="jobs-eyebrow">Candidate workspace</span>
                    <h1>Find your next opportunity</h1>

                    <p>Explore roles that match your skills, preferences and experience.</p>
                </div>
                <div className="jobs-page-badge">
                    <span>AI-assisted</span>
                    <small>skill matching</small>
                </div>

            </div>


            {/* FILTERS */}

            <section className="jobs-filter-card">

                <div className="jobs-filter-inner">

                    <form className="jobs-filter-form" onSubmit={handleSubmit}>

                        <div className="row g-3">

                            {/* KEYWORD */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    Keyword
                                </label>

                                <input
                                    type="text"
                                    name="keyword"
                                    className="form-control"
                                    placeholder="e.g. Java Developer"
                                    value={
                                        filters.keyword || ""
                                    }
                                    onChange={handleChange}
                                />

                            </div>


                            {/* LOCATION */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    className="form-control"
                                    placeholder="e.g. Prishtina"
                                    value={
                                        filters.location || ""
                                    }
                                    onChange={handleChange}
                                />

                            </div>


                            {/* EMPLOYMENT */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    Employment Type
                                </label>

                                <select
                                    name="employmentType"
                                    className="form-select"
                                    value={
                                        filters.employmentType || ""
                                    }
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        All
                                    </option>

                                    <option value="FULL_TIME">
                                        Full Time
                                    </option>

                                    <option value="PART_TIME">
                                        Part Time
                                    </option>

                                    <option value="CONTRACT">
                                        Contract
                                    </option>

                                    <option value="INTERNSHIP">
                                        Internship
                                    </option>

                                </select>

                            </div>


                            {/* EXPERIENCE */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    Experience Level
                                </label>

                                <select
                                    name="experienceLevel"
                                    className="form-select"
                                    value={
                                        filters.experienceLevel || ""
                                    }
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        All
                                    </option>

                                    <option value="ENTRY_LEVEL">
                                        Entry Level
                                    </option>

                                    <option value="MID_LEVEL">
                                        Mid Level
                                    </option>

                                    <option value="SENIOR_LEVEL">
                                        Senior Level
                                    </option>

                                </select>

                            </div>


                            {/* MIN SALARY */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    Minimum Salary
                                </label>

                                <input
                                    type="number"
                                    name="minSalary"
                                    className="form-control"
                                    placeholder="e.g. 500"
                                    min="0"
                                    value={
                                        filters.minSalary ?? ""
                                    }
                                    onChange={handleChange}
                                />

                            </div>


                            {/* MAX SALARY */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    Maximum Salary
                                </label>

                                <input
                                    type="number"
                                    name="maxSalary"
                                    className="form-control"
                                    placeholder="e.g. 2000"
                                    min="0"
                                    value={
                                        filters.maxSalary ?? ""
                                    }
                                    onChange={handleChange}
                                />

                            </div>


                            {/* SORT */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    Sort By
                                </label>

                                <select
                                    name="sortBy"
                                    className="form-select"
                                    value={
                                        filters.sortBy || "MATCH"
                                    }
                                    onChange={handleChange}
                                >

                                    <option value="MATCH">
                                        Best Match
                                    </option>

                                    <option value="SALARY">
                                        Highest Salary
                                    </option>

                                </select>

                            </div>


                            {/* BUTTONS */}

                            <div className="col-md-4 d-flex align-items-end gap-2">

                                <button
                                    type="submit"
                                    className="btn jobs-submit flex-grow-1"
                                >
                                    Search
                                </button>

                                <button
                                    type="button"
                                    className="btn jobs-reset"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </button>

                            </div>

                        </div>

                    </form>

                </div>

            </section>


            {/* ERROR */}

            {error && (
                <div className="jobs-alert" role="alert">
                    {error}
                </div>
            )}


            {/* LOADING */}

            {loading && (

                <div className="jobs-state">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <p className="text-muted mt-2">
                        Loading jobs...
                    </p>

                </div>

            )}


            {/* NO JOBS */}

            {!loading && jobs.length === 0 && (

                <div className="jobs-empty-state">

                    <h5>
                        No jobs found
                    </h5>

                    <p className="text-muted">
                        Try changing your filters.
                    </p>

                </div>

            )}


            {/* JOBS */}

            {!loading && jobs.length > 0 && (

                <>

                    <div className="jobs-results-header">

                        <h2>
                            Available Jobs
                        </h2>

                        <span className="jobs-results-count">
                            Showing {firstJobIndex + 1}-
                            {Math.min(
                                firstJobIndex + JOBS_PER_PAGE,
                                jobs.length
                            )} of {jobs.length} jobs
                        </span>

                    </div>


                    <div className="row g-4 jobs-grid">

                        {visibleJobs.map((job) => (

                            <div
                                className="col-md-6 col-lg-4 jobs-grid-item"
                                key={job.id}
                            >

                                <JobCard
                                    job={job}
                                    onDetails={setSelectedJob}
                                    hasApplied={
                                        appliedJobIds.includes(
                                            job.id
                                        )
                                    }
                                />

                            </div>

                        ))}

                    </div>

                    {totalPages > 1 && (
                        <nav
                            className="jobs-pagination"
                            aria-label="Jobs pagination"
                        >
                            <ul className="pagination justify-content-center flex-wrap mb-0">
                                <li
                                    className={`page-item ${
                                        currentPage === 1
                                            ? "disabled"
                                            : ""
                                    }`}
                                >
                                    <button
                                        type="button"
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage((page) =>
                                                Math.max(1, page - 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        aria-label="Previous page"
                                    >
                                        Previous
                                    </button>
                                </li>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                ).map((page) => (
                                    <li
                                        key={page}
                                        className={`page-item ${
                                            currentPage === page
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            className="page-link"
                                            onClick={() =>
                                                setCurrentPage(page)
                                            }
                                            aria-current={
                                                currentPage === page
                                                    ? "page"
                                                    : undefined
                                            }
                                        >
                                            {page}
                                        </button>
                                    </li>
                                ))}

                                <li
                                    className={`page-item ${
                                        currentPage === totalPages
                                            ? "disabled"
                                            : ""
                                    }`}
                                >
                                    <button
                                        type="button"
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage((page) =>
                                                Math.min(
                                                    totalPages,
                                                    page + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            currentPage === totalPages
                                        }
                                        aria-label="Next page"
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}

                </>

            )}


            {/* JOB DETAILS */}

            {selectedJob && (

                <JobDetails
                    job={selectedJob}

                    onClose={() =>
                        setSelectedJob(null)
                    }

                    hasApplied={
                        appliedJobIds.includes(
                            selectedJob.id
                        )
                    }

                    onApplicationSuccess={() =>
                        handleApplicationSuccess(
                            selectedJob.id
                        )
                    }
                />

            )}

        </div>
        </main>
    );
};

export default Jobs;
