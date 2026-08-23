import React, { useState } from "react";
import axios from "axios";
import type { Job } from "../../types/job";
import api from "../../services/api";

interface JobDetailsProps {
    job: Job;
    hasApplied: boolean;
    onApplicationSuccess: (jobId: number) => void;
    onClose: () => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({
                                                   job,
                                                   hasApplied,
                                                   onApplicationSuccess,
                                                   onClose,
                                               }) => {

    const [coverLetter, setCoverLetter] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =====================================================
    // APPLY
    // =====================================================

    const handleApply = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (hasApplied) {
            return;
        }

        if (!coverLetter.trim()) {

            setError(
                "Please write a cover letter before applying."
            );

            return;
        }

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            await api.post(
                `/jobs/${job.id}/apply`,
                {
                    coverLetter:
                        coverLetter.trim(),
                }
            );


            setSuccess(
                "Application submitted successfully!"
            );

            setCoverLetter("");


            // Update Jobs page immediately
            onApplicationSuccess(job.id);

        } catch (err: unknown) {

            console.error(err);

            if (axios.isAxiosError(err)) {

                setError(
                    err.response?.data?.message ||
                    "Failed to submit application."
                );

            } else {

                setError(
                    "Failed to submit application."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    return (

        <div
            className="modal d-block"
            tabIndex={-1}
            style={{
                backgroundColor:
                    "rgba(0,0,0,0.5)",
            }}
        >

            <div className="modal-dialog modal-lg modal-dialog-scrollable">

                <div className="modal-content">


                    {/* ================= HEADER ================= */}

                    <div className="modal-header">

                        <div>

                            <h5 className="modal-title fw-bold">
                                {job.title}
                            </h5>

                            <p className="text-muted mb-0">
                                {job.companyName}
                            </p>

                        </div>


                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        />

                    </div>


                    {/* ================= BODY ================= */}

                    <div className="modal-body">


                        {/* APPLICATION STATUS */}

                        {hasApplied && (

                            <div className="alert alert-success">

                                <h6 className="fw-bold mb-1">
                                    Application Submitted ✓
                                </h6>

                                <p className="mb-0">
                                    You have already applied
                                    for this position.
                                </p>

                            </div>

                        )}


                        {/* JOB INFORMATION */}

                        <div className="card border-0 bg-light mb-4">

                            <div className="card-body">

                                <h5 className="fw-bold mb-3">
                                    Job Information
                                </h5>


                                <div className="row">


                                    <div className="col-md-6 mb-3">

                                        <strong>
                                            Company:
                                        </strong>

                                        <div>
                                            {job.companyName}
                                        </div>

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <strong>
                                            Location:
                                        </strong>

                                        <div>
                                            📍 {job.location}
                                        </div>

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <strong>
                                            Employment Type:
                                        </strong>

                                        <div>
                                            {job.employmentType}
                                        </div>

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <strong>
                                            Experience Level:
                                        </strong>

                                        <div>
                                            {job.experienceLevel}
                                        </div>

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <strong>
                                            Salary:
                                        </strong>

                                        <div>
                                            💰 {job.salaryMin} -{" "}
                                            {job.salaryMax}
                                        </div>

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <strong>
                                            Application Deadline:
                                        </strong>

                                        <div>
                                            📅{" "}
                                            {job.applicationDeadline}
                                        </div>

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <strong>
                                            Status:
                                        </strong>

                                        <div>

                                            <span className="badge bg-success">
                                                {job.status}
                                            </span>

                                        </div>

                                    </div>


                                    {job.companyWebsite && (

                                        <div className="col-md-6 mb-3">

                                            <strong>
                                                Company Website:
                                            </strong>

                                            <div>

                                                <a
                                                    href={
                                                        job.companyWebsite
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Visit Website
                                                </a>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="mb-4">

                            <h5 className="fw-bold">
                                Description
                            </h5>

                            <p className="text-muted">
                                {job.description}
                            </p>

                        </div>


                        {/* REQUIREMENTS */}

                        <div className="mb-4">

                            <h5 className="fw-bold">
                                Requirements
                            </h5>

                            <p className="text-muted">
                                {job.requirements}
                            </p>

                        </div>


                        {/* SKILLS */}

                        <div className="mb-4">

                            <h5 className="fw-bold">
                                Required Skills
                            </h5>

                            <p className="text-muted">
                                {job.skills}
                            </p>

                        </div>


                        <hr />


                        {/* ================= AI MATCHING ================= */}

                        {/* ================= AI MATCHING ================= */}

                        <div className="card border-0 bg-light mb-4">

                            <div className="card-body">

                                <h5 className="fw-bold mb-4">
                                    🤖 AI Job Matching
                                </h5>


                                {/* MATCH PERCENTAGE */}

                                {job.matchPercentage !== null &&
                                job.matchPercentage !== undefined ? (

                                    <>

                                        {/* MATCH SCORE */}

                                        <div className="mb-4">

                                            <div className="d-flex justify-content-between align-items-center mb-2">

                                                <strong>
                                                    Overall Match
                                                </strong>

                                                <span className="fw-bold text-success fs-5">
                            {job.matchPercentage.toFixed(2)}%
                        </span>

                                            </div>


                                            <div
                                                className="progress"
                                                style={{
                                                    height: "12px",
                                                }}
                                            >

                                                <div
                                                    className="progress-bar bg-success"
                                                    role="progressbar"
                                                    style={{
                                                        width: `${job.matchPercentage}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>


                                        {/* ================= CANDIDATE SKILLS ================= */}

                                        {job.candidateSkills &&
                                            job.candidateSkills.length > 0 && (

                                                <div className="mb-4">

                                                    <h6 className="fw-bold mb-2">
                                                        👤 Your Skills
                                                    </h6>

                                                    <p className="text-muted small mb-2">
                                                        Skills extracted from your CV
                                                    </p>

                                                    <div className="d-flex flex-wrap gap-2">

                                                        {job.candidateSkills.map(
                                                            (skill, index) => (

                                                                <span
                                                                    key={index}
                                                                    className="badge bg-primary"
                                                                >
                                            {skill}
                                        </span>

                                                            )
                                                        )}

                                                    </div>

                                                </div>
                                            )}


                                        {/* ================= REQUIRED SKILLS ================= */}

                                        <div className="mb-4">

                                            <h6 className="fw-bold mb-2">
                                                💼 Required Job Skills
                                            </h6>

                                            <p className="text-muted small mb-2">
                                                Skills required for this position
                                            </p>

                                            <div className="d-flex flex-wrap gap-2">

                                                {job.skills
                                                    ?.split(",")
                                                    .map((skill, index) => {

                                                        const cleanSkill =
                                                            skill.trim();

                                                        if (!cleanSkill) {
                                                            return null;
                                                        }

                                                        return (
                                                            <span
                                                                key={index}
                                                                className="badge bg-secondary"
                                                            >
                                        {cleanSkill}
                                    </span>
                                                        );
                                                    })}

                                            </div>

                                        </div>


                                        {/* ================= MATCHED SKILLS ================= */}

                                        {job.matchedSkills &&
                                            job.matchedSkills.length > 0 && (

                                                <div className="mb-4">

                                                    <h6 className="fw-bold text-success mb-2">
                                                        ✓ Matched Skills
                                                    </h6>

                                                    <p className="text-muted small mb-2">
                                                        Skills from your CV that match the job
                                                        requirements
                                                    </p>

                                                    <div className="d-flex flex-wrap gap-2">

                                                        {job.matchedSkills.map(
                                                            (skill, index) => (

                                                                <span
                                                                    key={index}
                                                                    className="badge bg-success"
                                                                >
                                            ✓ {skill}
                                        </span>

                                                            )
                                                        )}

                                                    </div>

                                                </div>
                                            )}


                                        {/* ================= MISSING SKILLS ================= */}

                                        {job.missingSkills &&
                                            job.missingSkills.length > 0 && (

                                                <div className="mb-3">

                                                    <h6 className="fw-bold text-danger mb-2">
                                                        ✗ Missing Skills
                                                    </h6>

                                                    <p className="text-muted small mb-2">
                                                        Required skills that were not found
                                                        in your CV
                                                    </p>

                                                    <div className="d-flex flex-wrap gap-2">

                                                        {job.missingSkills.map(
                                                            (skill, index) => (

                                                                <span
                                                                    key={index}
                                                                    className="badge bg-danger"
                                                                >
                                            ✗ {skill}
                                        </span>

                                                            )
                                                        )}

                                                    </div>

                                                </div>
                                            )}


                                    </>

                                ) : (

                                    <div className="alert alert-info mb-0">

                                        <strong>
                                            AI matching is not available yet.
                                        </strong>

                                        <br />

                                        Upload your CV to allow the system to compare
                                        your skills with the requirements of this job.

                                    </div>

                                )}

                            </div>

                        </div>


                        <hr />


                        {/* ================= APPLY ================= */}

                        {hasApplied ? (

                            <div className="text-center py-3">

                                <div className="alert alert-success">

                                    <h5 className="fw-bold">
                                        You already applied ✓
                                    </h5>

                                    <p className="mb-0">
                                        Your application for this
                                        job has already been submitted.
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <form onSubmit={handleApply}>

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Cover Letter
                                    </label>

                                    <textarea
                                        className="form-control"
                                        rows={6}
                                        placeholder="Write your cover letter..."
                                        value={
                                            coverLetter
                                        }
                                        onChange={(e) =>
                                            setCoverLetter(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <small className="text-muted">
                                        A cover letter is required to apply.
                                    </small>

                                </div>


                                {/* ERROR */}

                                {error && (

                                    <div className="alert alert-danger">
                                        {error}
                                    </div>

                                )}


                                {/* SUCCESS */}

                                {success && (

                                    <div className="alert alert-success">
                                        {success}
                                    </div>

                                )}


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Applying..."
                                        : "Apply for this job"}

                                </button>

                            </form>

                        )}


                    </div>


                    {/* ================= FOOTER ================= */}

                    <div className="modal-footer">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
};

export default JobDetails;