import React, { useEffect, useRef, useState } from "react";
import JobCard from "../../components/JobCard";
import { ArrowDownUp, SlidersHorizontal, X } from "lucide-react";
import {
    filterJobs,
} from "../../services/jobService";
import type {
    Job,
    JobFilterRequest,
} from "../../types/job";
import JobDetails from "./JobDetails";
import api from "../../services/api";
import { useLanguage } from "../../i18n/LanguageContext";

const JOBS_PER_PAGE = 9;

const Jobs: React.FC = () => {
    const { t } = useLanguage();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const jobsRequestId = useRef(0);

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);

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

    const activeFilterCount = [
        filters.keyword,
        filters.location,
        filters.employmentType,
        filters.experienceLevel,
        filters.minSalary !== undefined,
        filters.maxSalary !== undefined,
    ].filter(Boolean).length;
    const hasPendingMatches = jobs.some((job) => job.matchingPending);

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

    const pollPendingMatches = async (
        requestedFilters: JobFilterRequest,
        requestId: number,
        initialData: Job[]
    ) => {
        let latestData = initialData;

        for (let attempt = 0; attempt < 30; attempt += 1) {
            if (
                requestId !== jobsRequestId.current ||
                !latestData.some((job) => job.matchingPending)
            ) {
                return;
            }

            await new Promise((resolve) => window.setTimeout(resolve, 700));

            if (requestId !== jobsRequestId.current) {
                return;
            }

            try {
                latestData = await filterJobs(requestedFilters);

                if (requestId !== jobsRequestId.current) {
                    return;
                }

                setJobs(latestData);
            } catch (pollError) {
                console.error("Failed to refresh pending job matches:", pollError);
                return;
            }
        }
    };

    const loadJobs = async (requestedFilters: JobFilterRequest = filters) => {
        const requestId = jobsRequestId.current + 1;
        jobsRequestId.current = requestId;

        try {

            setLoading(true);
            setError("");

            // Always use the candidate endpoint so the default Best Match
            // sort also receives AI match scores on the initial load.
            const data = await filterJobs(requestedFilters);

            if (requestId !== jobsRequestId.current) {
                return;
            }

            setJobs(data);
            setCurrentPage(1);

            // The backend returns cached scores immediately and schedules only
            // missing CV/job combinations. Refresh those scores without
            // blocking the initial job list from being displayed.
            if (data.some((job) => job.matchingPending)) {
                void pollPendingMatches(requestedFilters, requestId, data);
            }

        } catch (err) {

            console.error(err);

            if (requestId === jobsRequestId.current) {
                setError("Failed to load jobs. Please try again.");
            }

        } finally {

            if (requestId === jobsRequestId.current) {
                setLoading(false);
            }

        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            await Promise.all([
                loadJobs(filters),
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
        void loadJobs(filters);

    };

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextFilters: JobFilterRequest = {
            ...filters,
            sortBy: event.target.value as JobFilterRequest["sortBy"],
        };

        setFilters(nextFilters);
        setCurrentPage(1);
        void loadJobs(nextFilters);
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

        await loadJobs(defaultFilters);

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
                    <span className="jobs-eyebrow">{t("candidate.workspace")}</span>
                    <h1>{t("jobs.title")}</h1>

                    <p>{t("jobs.description")}</p>
                </div>
                <div className="jobs-page-badge">
                        <span>{t("jobs.aiAssisted")}</span>
                        <small>{t("jobs.skillMatching")}</small>
                </div>

            </div>


            {/* FILTERS */}

            <section className="jobs-filter-card">

                <div className="jobs-filter-toolbar">
                    <div className="jobs-filter-summary">
                        <span className="jobs-filter-kicker">{t("jobs.searchControls")}</span>
                        <strong>
                            {activeFilterCount > 0
                                ? t("jobs.filtersActive", { count: activeFilterCount, suffix: activeFilterCount === 1 ? "" : "s" })
                                : t("jobs.browseAll")}
                        </strong>
                    </div>

                    <div className="jobs-filter-toolbar-actions">
                        <label className="jobs-sort-control">
                            <ArrowDownUp size={15} aria-hidden="true" />
                            <span>{t("jobs.sortBy")}</span>
                            <select
                                name="sortBy"
                                aria-label={t("jobs.sortAria")}
                                value={filters.sortBy || "MATCH"}
                                onChange={handleSortChange}
                            >
                                <option value="MATCH">{t("jobs.bestMatch")}</option>
                                <option value="SALARY">{t("jobs.highestSalary")}</option>
                            </select>
                        </label>

                        <button
                            type="button"
                            className="jobs-filter-toggle"
                            aria-controls="candidate-job-filters"
                            aria-expanded={filtersOpen}
                            onClick={() => setFiltersOpen((open) => !open)}
                        >
                            {filtersOpen ? <X size={16} aria-hidden="true" /> : <SlidersHorizontal size={16} aria-hidden="true" />}
                            {filtersOpen ? t("jobs.closeFilters") : t("jobs.openFilters")}
                            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
                        </button>
                    </div>
                </div>

                {filtersOpen && <div className="jobs-filter-inner" id="candidate-job-filters">

                    <form className="jobs-filter-form" onSubmit={handleSubmit}>

                        <div className="row g-3">

                            {/* KEYWORD */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    {t("jobs.keyword")}
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
                                    {t("jobs.location")}
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
                                    {t("jobs.employmentType")}
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
                                        {t("jobs.all")}
                                    </option>

                                    <option value="FULL_TIME">
                                        {t("jobs.fullTime")}
                                    </option>

                                    <option value="PART_TIME">
                                        {t("jobs.partTime")}
                                    </option>

                                    <option value="CONTRACT">
                                        {t("jobs.contract")}
                                    </option>

                                    <option value="INTERNSHIP">
                                        {t("jobs.internship")}
                                    </option>

                                </select>

                            </div>


                            {/* EXPERIENCE */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    {t("jobs.experienceLevel")}
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
                                        {t("jobs.all")}
                                    </option>

                                    <option value="ENTRY_LEVEL">
                                        {t("jobs.entryLevel")}
                                    </option>

                                    <option value="MID_LEVEL">
                                        {t("jobs.midLevel")}
                                    </option>

                                    <option value="SENIOR_LEVEL">
                                        {t("jobs.seniorLevel")}
                                    </option>

                                </select>

                            </div>


                            {/* MIN SALARY */}

                            <div className="col-md-4">

                                <label className="form-label fw-semibold">
                                    {t("jobs.minimumSalary")}
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
                                    {t("jobs.maximumSalary")}
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


                            {/* BUTTONS */}

                            <div className="col-md-4 d-flex align-items-end gap-2">

                                <button
                                    type="submit"
                                    className="btn jobs-submit flex-grow-1"
                                >
                                    {t("jobs.search")}
                                </button>

                                <button
                                    type="button"
                                    className="btn jobs-reset"
                                    onClick={resetFilters}
                                >
                                    {t("jobs.reset")}
                                </button>

                            </div>

                        </div>

                    </form>

                </div>}

            </section>


            {/* ERROR */}

            {error && (
                <div className="jobs-alert" role="alert">
                    {error}
                </div>
            )}

            {!loading && hasPendingMatches && (
                <div className="jobs-matching-notice" role="status" aria-live="polite">
                    <span className="jobs-matching-spinner" aria-hidden="true" />
                    <div>
                        <strong>{t("jobs.cvMatchingInProgress")}</strong>
                        <p>{t("jobs.cvMatchingInProgressDescription")}</p>
                    </div>
                </div>
            )}


            {/* LOADING */}

            {loading && (

                <div className="jobs-state" role="status" aria-live="polite">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <div className="jobs-loading-copy">
                        <p className="jobs-loading-title">
                            {t("jobs.matchingInProgress")}
                        </p>
                        <p className="jobs-loading-description">
                            {t("jobs.matchingInProgressDescription")}
                        </p>
                    </div>

                </div>

            )}


            {/* NO JOBS */}

            {!loading && jobs.length === 0 && (

                <div className="jobs-empty-state">

                    <h5>
                         {t("jobs.none")}
                    </h5>

                    <p className="text-muted">
                         {t("jobs.tryFilters")}
                    </p>

                </div>

            )}


            {/* JOBS */}

            {!loading && jobs.length > 0 && (

                <>

                    <div className="jobs-results-header">

                        <h2>
                             {t("jobs.available")}
                        </h2>

                        <span className="jobs-results-count">
                            {t("jobs.showing", { from: firstJobIndex + 1, to: Math.min(
                                firstJobIndex + JOBS_PER_PAGE,
                                jobs.length
                            ), count: jobs.length })}
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
                             aria-label={t("jobs.pagination")}
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
                                         aria-label={t("jobs.previous")}
                                    >
                                        {t("jobs.previous")}
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
                                         aria-label={t("jobs.next")}
                                    >
                                        {t("jobs.next")}
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
