import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, UsersRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getApplicationsWithCandidate,
    updateApplicationStatus,
} from "../../services/applicationService";
import { getCandidateCv } from "../../services/cvService";
import { getMyJobById } from "../../services/jobService";
import type { Application, ApplicationStatus } from "../../types/application";
import type { Job } from "../../types/job";
import {
    DashboardShell,
    EmptyState,
    ErrorState,
    formatDate,
    MetricCard,
    SectionCard,
    StatusBadge,
} from "../../components/dashboard/DashboardPrimitives";

const APPLICATION_STATUSES: ApplicationStatus[] = [
    "PENDING",
    "REVIEWING",
    "SHORTLISTED",
    "ACCEPTED",
    "REJECTED",
];

const JobApplications: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [openingCvId, setOpeningCvId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        if (!jobId) {
            setError("This job could not be identified.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const [jobData, applicationData] = await Promise.all([
                getMyJobById(Number(jobId)),
                getApplicationsWithCandidate(Number(jobId)),
            ]);
            setJob(jobData);
            setApplications(applicationData);
        } catch (loadError) {
            console.error("Failed to load job applications:", loadError);
            setError("The job or its applications could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleStatusChange = async (
        applicationId: number,
        status: ApplicationStatus
    ) => {
        setUpdatingId(applicationId);
        setError("");

        try {
            await updateApplicationStatus(applicationId, status);
            setApplications((current) =>
                current
                    ? current.map((application) =>
                        application.id === applicationId
                            ? { ...application, status }
                            : application
                    )
                    : current
            );
        } catch (updateError) {
            console.error("Failed to update application status:", updateError);
            setError("The status was not updated. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleOpenCv = async (candidateId: number) => {
        const cvWindow = window.open("about:blank", "_blank");
        setOpeningCvId(candidateId);
        setError("");

        try {
            const blob = await getCandidateCv(candidateId);
            const url = URL.createObjectURL(blob);

            if (cvWindow) {
                cvWindow.location.href = url;
            } else {
                window.open(url, "_blank", "noopener,noreferrer");
            }
        } catch (cvError) {
            console.error("Failed to open candidate CV:", cvError);
            cvWindow?.close();
            setError("The CV could not be opened.");
        } finally {
            setOpeningCvId(null);
        }
    };

    return (
        <DashboardShell
            eyebrow="Candidate review"
            title={job?.title || "Job applications"}
            description={
                job
                    ? `${job.companyName || "Your company"} · ${applications?.length ?? 0} applications`
                    : "Review and update candidate applications."
            }
            actions={
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/recruiter/dashboard")}
                >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Back to dashboard
                </button>
            }
        >
            {error && <ErrorState message={error} onRetry={() => void loadData()} />}

            <div className="dashboard-metrics">
                <MetricCard
                    label="Applications"
                    value={loading ? "…" : applications ? applications.length : "—"}
                    hint="For this job"
                    icon={<UsersRound size={21} />}
                    tone="blue"
                />
                <MetricCard
                    label="Shortlisted"
                    value={loading ? "…" : applications ? applications.filter((application) => application.status === "SHORTLISTED").length : "—"}
                    hint="Ready for next step"
                    icon={<UsersRound size={21} />}
                    tone="green"
                />
            </div>

            <SectionCard
                title="Applications"
                description="Use the AI match as supporting evidence, then review the candidate profile and CV before deciding."
            >
                {loading && <div className="dashboard-state">Loading candidate applications…</div>}
                {!loading && applications && applications.length === 0 && (
                    <EmptyState
                        title="No applications yet"
                        description="Applications for this job will appear here when candidates apply."
                    />
                )}
                {!loading && applications && applications.length > 0 && (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th scope="col">Candidate</th>
                                    <th scope="col">AI match</th>
                                    <th scope="col">Applied</th>
                                    <th scope="col">Status</th>
                                    <th scope="col"><span className="visually-hidden">CV</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((application) => (
                                    <tr key={application.id}>
                                        <td>
                                            <span className="dashboard-primary-cell">
                                                {application.candidateFullName}
                                            </span>
                                            <span className="dashboard-secondary-cell">
                                                {application.candidateEmail}
                                            </span>
                                        </td>
                                        <td>
                                            {application.matchPercentage === null ||
                                            application.matchPercentage === undefined
                                                ? "Not available"
                                                : `${application.matchPercentage.toFixed(1)}%`}
                                        </td>
                                        <td>{formatDate(application.appliedAt)}</td>
                                        <td>
                                            <label className="visually-hidden" htmlFor={`status-${application.id}`}>
                                                Status for {application.candidateFullName}
                                            </label>
                                            <select
                                                id={`status-${application.id}`}
                                                className="form-select form-select-sm"
                                                value={application.status}
                                                disabled={updatingId === application.id}
                                                onChange={(event) =>
                                                    void handleStatusChange(
                                                        application.id,
                                                        event.target.value as ApplicationStatus
                                                    )
                                                }
                                            >
                                                {APPLICATION_STATUSES.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="mt-1">
                                                <StatusBadge status={application.status} />
                                            </div>
                                        </td>
                                        <td>
                                            {application.cvFilePath ? (
                                                <button
                                                    type="button"
                                                    className="dashboard-link dashboard-table-action"
                                                    disabled={openingCvId === application.candidateProfileId}
                                                    onClick={() => void handleOpenCv(application.candidateProfileId)}
                                                >
                                                    {openingCvId === application.candidateProfileId ? "Opening…" : "CV"} <ExternalLink size={14} aria-hidden="true" />
                                                </button>
                                            ) : (
                                                "No CV"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            <Link to="/recruiter/dashboard" className="dashboard-link d-inline-flex align-items-center gap-1 mt-3">
                <ArrowLeft size={15} aria-hidden="true" />
                Back to all jobs
            </Link>
        </DashboardShell>
    );
};

export default JobApplications;
