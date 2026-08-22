import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import type { Job } from "../../types/job";

const JobDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get<Job>(
                    `http://localhost:8080/api/v1/candidate/jobs/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                setJob(response.data);

            } catch (err: unknown) {
                console.error(err);

                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load job details."
                    );
                } else {
                    setError("Failed to load job details.");
                }

            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJobDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="container mt-5">
                <p>Loading job details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    {error}
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    ← Back to Jobs
                </button>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container mt-5">
                <p>Job not found.</p>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    ← Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">

            {/* BACK */}
            <button
                className="btn btn-outline-secondary mb-4"
                onClick={() => navigate(-1)}
            >
                ← Back to Jobs
            </button>

            {/* JOB HEADER */}
            <div className="card shadow-sm mb-4">
                <div className="card-body p-4">

                    <h2 className="fw-bold mb-3">
                        {job.title}
                    </h2>

                    <p className="text-muted mb-2">
                        📍 {job.location}
                    </p>

                    <p className="text-muted mb-2">
                        💼 {job.employmentType}
                    </p>

                    <p className="text-muted mb-2">
                        🎯 {job.experienceLevel}
                    </p>

                    {job.salaryMin != null &&
                        job.salaryMax != null && (
                            <p className="fw-bold mb-2">
                                💰 {job.salaryMin} - {job.salaryMax}
                            </p>
                        )}

                    {job.applicationDeadline && (
                        <p className="text-muted mb-0">
                            📅 Application deadline:{" "}
                            {job.applicationDeadline}
                        </p>
                    )}

                </div>
            </div>

            {/* COMPANY */}
            <div className="card shadow-sm mb-4">
                <div className="card-body p-4">

                    <h4 className="fw-bold mb-3">
                        Company
                    </h4>

                    <p className="mb-2">
                        <strong>{job.companyName}</strong>
                    </p>

                    {job.companyWebsite && (
                        <a
                            href={job.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {job.companyWebsite}
                        </a>
                    )}

                </div>
            </div>

            {/* DESCRIPTION */}
            <div className="card shadow-sm mb-4">
                <div className="card-body p-4">

                    <h4 className="fw-bold">
                        Job Description
                    </h4>

                    <p className="mt-3">
                        {job.description}
                    </p>

                </div>
            </div>

            {/* REQUIREMENTS */}
            <div className="card shadow-sm mb-4">
                <div className="card-body p-4">

                    <h4 className="fw-bold">
                        Requirements
                    </h4>

                    <p className="mt-3">
                        {job.requirements}
                    </p>

                </div>
            </div>

            {/* SKILLS */}
            <div className="card shadow-sm mb-4">
                <div className="card-body p-4">

                    <h4 className="fw-bold">
                        Required Skills
                    </h4>

                    <p className="mt-3">
                        {job.skills}
                    </p>

                </div>
            </div>

            {/* AI MATCHING */}
            {job.matchPercentage != null && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body p-4">

                        <h4 className="fw-bold">
                            AI Job Matching
                        </h4>

                        <h5 className="mt-3">
                            Match:{" "}
                            <span className="text-success">
                                {job.matchPercentage}%
                            </span>
                        </h5>

                        {job.matchedSkills &&
                            job.matchedSkills.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="fw-bold">
                                        Matched Skills
                                    </h6>

                                    <ul>
                                        {job.matchedSkills.map(
                                            (skill, index) => (
                                                <li key={index}>
                                                    {skill}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        {job.missingSkills &&
                            job.missingSkills.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="fw-bold">
                                        Missing Skills
                                    </h6>

                                    <ul>
                                        {job.missingSkills.map(
                                            (skill, index) => (
                                                <li key={index}>
                                                    {skill}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                    </div>
                </div>
            )}

            {/* APPLY */}
            <div className="text-center mt-4">
                <button
                    className="btn btn-primary btn-lg px-5"
                    onClick={() =>
                        navigate(`/jobs/${id}/apply`)
                    }
                >
                    Apply for this job
                </button>
            </div>

        </div>
    );
};

export default JobDetails;