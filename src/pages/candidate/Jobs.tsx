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
import axios from "axios";

const Jobs: React.FC = () => {

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

    }, []);


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
        <div className="container py-5">

            {/* HEADER */}

            <div className="mb-4">

                <h2 className="fw-bold">
                    Find Jobs
                </h2>

                <p className="text-muted">
                    Discover jobs that match your skills and
                    experience.
                </p>

            </div>


            {/* FILTERS */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body p-4">

                    <form onSubmit={handleSubmit}>

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
                                    className="btn btn-primary flex-grow-1"
                                >
                                    Search
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </button>

                            </div>

                        </div>

                    </form>

                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}


            {/* LOADING */}

            {loading && (

                <div className="text-center py-5">

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

                <div className="text-center py-5">

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

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h5 className="fw-bold mb-0">
                            Available Jobs
                        </h5>

                        <span className="text-muted">
                            {jobs.length} jobs found
                        </span>

                    </div>


                    <div className="row g-4">

                        {jobs.map((job) => (

                            <div
                                className="col-md-6 col-lg-4"
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
    );
};

export default Jobs;