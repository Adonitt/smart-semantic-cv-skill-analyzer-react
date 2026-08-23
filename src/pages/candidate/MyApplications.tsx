import React, { useEffect, useState } from "react";
import {
    getMyApplications,
} from "../../services/applicationService";

import type {
    Application,
} from "../../types/application";

const MyApplications: React.FC = () => {

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadApplications = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getMyApplications();

                setApplications(data);

            } catch (err) {

                console.error(err);

                setError(
                    "Failed to load your applications."
                );

            } finally {

                setLoading(false);

            }
        };

        loadApplications();

    }, []);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="container py-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p className="text-muted mt-3">
                    Loading your applications...
                </p>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {
        return (
            <div className="container py-5">

                <div className="alert alert-danger">
                    {error}
                </div>

            </div>
        );
    }


    // =====================================================
    // NO APPLICATIONS
    // =====================================================

    if (applications.length === 0) {
        return (
            <div className="container py-5">

                <div className="mb-4">

                    <h2 className="fw-bold">
                        My Applications
                    </h2>

                    <p className="text-muted">
                        Track the jobs you have applied for.
                    </p>

                </div>

                <div className="card border-0 shadow-sm">

                    <div className="card-body text-center py-5">

                        <h5>
                            No applications yet
                        </h5>

                        <p className="text-muted mb-0">
                            You have not applied for any jobs yet.
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // APPLICATIONS
    // =====================================================

    return (
        <div className="container py-5">

            <div className="mb-4">

                <h2 className="fw-bold">
                    My Applications
                </h2>

                <p className="text-muted">
                    Track the jobs you have applied for and
                    check your application status.
                </p>

            </div>


            <div className="row g-4">

                {applications.map((application) => (

                    <div
                        className="col-md-6 col-lg-4"
                        key={application.id}
                    >

                        <div className="card border-0 shadow-sm h-100">

                            <div className="card-body p-4">

                                {/* JOB TITLE */}

                                <h5 className="fw-bold mb-2">
                                    {application.jobTitle}
                                </h5>


                                {/* APPLICATION DATE */}

                                <p className="text-muted mb-3">
                                    Applied on:{" "}
                                    {new Date(
                                        application.appliedAt
                                    ).toLocaleDateString()}
                                </p>


                                {/* STATUS */}

                                <div className="mb-3">

                                    <span
                                        className={`badge ${
                                            application.status === "ACCEPTED"
                                                ? "bg-success"
                                                : application.status === "REJECTED"
                                                    ? "bg-danger"
                                                    : "bg-warning text-dark"
                                        }`}
                                    >
                                        {application.status}
                                    </span>

                                </div>


                                {/* MATCH */}

                                {application.matchPercentage !== null &&
                                    application.matchPercentage !== undefined && (

                                        <div className="mb-3">

                                            <strong>
                                                AI Match:
                                            </strong>{" "}

                                            <span className="text-success fw-bold">
                                                {application.matchPercentage.toFixed(1)}%
                                            </span>

                                        </div>

                                    )}


                                {/* COVER LETTER */}

                                {application.coverLetter && (

                                    <div className="mb-3">

                                        <h6 className="fw-bold">
                                            Cover Letter
                                        </h6>

                                        <p className="text-muted">
                                            {application.coverLetter}
                                        </p>

                                    </div>

                                )}


                                {/* MATCHED SKILLS */}

                                {application.matchedSkills &&
                                    application.matchedSkills.length > 0 && (

                                        <div className="mb-3">

                                            <h6 className="fw-bold">
                                                Matched Skills
                                            </h6>

                                            <div className="d-flex flex-wrap gap-2">

                                                {application.matchedSkills.map(
                                                    (skill, index) => (

                                                        <span
                                                            key={index}
                                                            className="badge bg-success"
                                                        >
                                                            {skill}
                                                        </span>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )}


                                {/* MISSING SKILLS */}

                                {application.missingSkills &&
                                    application.missingSkills.length > 0 && (

                                        <div className="mb-3">

                                            <h6 className="fw-bold">
                                                Missing Skills
                                            </h6>

                                            <div className="d-flex flex-wrap gap-2">

                                                {application.missingSkills.map(
                                                    (skill, index) => (

                                                        <span
                                                            key={index}
                                                            className="badge bg-secondary"
                                                        >
                                                            {skill}
                                                        </span>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )}

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
};

export default MyApplications;