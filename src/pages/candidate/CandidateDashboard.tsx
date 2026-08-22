import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Briefcase,
    FileText,
    Search,
    User
} from "lucide-react";

import { getPublishedJobs } from "../../services/jobService";
import { getMyApplications } from "../../services/applicationService";

const CandidateDashboard: React.FC = () => {

    const fullName =
        localStorage.getItem("fullName") || "Candidate";

    const [jobCount, setJobCount] = useState<number>(0);
    const [applicationCount, setApplicationCount] =
        useState<number>(0);

    const [loadingJobs, setLoadingJobs] =
        useState<boolean>(true);

    const [loadingApplications, setLoadingApplications] =
        useState<boolean>(true);

    useEffect(() => {

        loadDashboardData();

    }, []);

    const loadDashboardData = async () => {

        // =====================================================
        // LOAD PUBLISHED JOBS
        // =====================================================

        try {

            const jobs = await getPublishedJobs();

            setJobCount(jobs.length);

        } catch (error) {

            console.error(
                "Failed to load published jobs:",
                error
            );

            setJobCount(0);

        } finally {

            setLoadingJobs(false);
        }


        // =====================================================
        // LOAD MY APPLICATIONS
        // =====================================================

        try {

            const applications =
                await getMyApplications();

            setApplicationCount(
                applications.length
            );

        } catch (error) {

            console.error(
                "Failed to load applications:",
                error
            );

            setApplicationCount(0);

        } finally {

            setLoadingApplications(false);
        }
    };


    return (
        <div className="container py-5">

            {/* ================================================= */}
            {/* WELCOME */}
            {/* ================================================= */}

            <div className="mb-5">

                <h2 className="fw-bold">
                    Welcome, {fullName} 👋
                </h2>

                <p className="text-muted">
                    Find your next opportunity and manage
                    your applications.
                </p>

            </div>


            {/* ================================================= */}
            {/* STATISTICS */}
            {/* ================================================= */}

            <div className="row g-4 mb-5">

                {/* AVAILABLE JOBS */}

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <p className="text-muted mb-1">
                                        Available Jobs
                                    </p>

                                    <h3 className="fw-bold mb-0">

                                        {loadingJobs
                                            ? "..."
                                            : jobCount}

                                    </h3>

                                </div>

                                <div className="text-primary">

                                    <Briefcase size={36} />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* MY APPLICATIONS */}

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <p className="text-muted mb-1">
                                        My Applications
                                    </p>

                                    <h3 className="fw-bold mb-0">

                                        {loadingApplications
                                            ? "..."
                                            : applicationCount}

                                    </h3>

                                </div>

                                <div className="text-success">

                                    <FileText size={36} />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* PROFILE */}

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <p className="text-muted mb-1">
                                        Profile
                                    </p>

                                    <h3 className="fw-bold mb-0">
                                        Candidate
                                    </h3>

                                </div>

                                <div className="text-warning">

                                    <User size={36} />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* MAIN ACTIONS */}
            {/* ================================================= */}

            <div className="row g-4">


                {/* ================================================= */}
                {/* FIND JOBS */}
                {/* ================================================= */}

                <div className="col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <div className="d-flex align-items-center mb-3">

                                <Search
                                    size={30}
                                    className="text-primary me-3"
                                />

                                <h4 className="fw-bold mb-0">
                                    Find Jobs
                                </h4>

                            </div>

                            <p className="text-muted">

                                Explore available jobs and find
                                positions that match your skills
                                and experience.

                            </p>

                            <Link
                                to="/candidate/jobs"
                                className="btn btn-primary"
                            >
                                Browse Jobs
                            </Link>

                        </div>

                    </div>

                </div>


                {/* ================================================= */}
                {/* APPLICATIONS */}
                {/* ================================================= */}

                <div className="col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <div className="d-flex align-items-center mb-3">

                                <FileText
                                    size={30}
                                    className="text-success me-3"
                                />

                                <h4 className="fw-bold mb-0">
                                    My Applications
                                </h4>

                            </div>

                            <p className="text-muted">

                                Track the jobs you have applied for
                                and check your application status.

                            </p>

                            <Link
                                to="/candidate/applications"
                                className="btn btn-success"
                            >
                                View Applications
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CandidateDashboard;