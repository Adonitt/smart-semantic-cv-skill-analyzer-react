import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Edit3, Eye, FileText, Plus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { getApplicationsWithCandidate } from "../../services/applicationService";
import { getMyJobs } from "../../services/jobService";
import type { Application } from "../../types/application";
import type { Job } from "../../types/job";
import {
    DashboardShell,
    EmptyState,
    ErrorState,
    formatDate,
    formatEmploymentType,
    MetricCard,
    SectionCard,
    StatusBadge,
} from "../../components/dashboard/DashboardPrimitives";

type ApplicationsByJob = Record<number, Application[]>;

const RecruiterDashboard: React.FC = () => {
    const fullName = localStorage.getItem("fullName") || "Recruiter";
    const [jobs, setJobs] = useState<Job[] | null>(null);
    const [applicationsByJob, setApplicationsByJob] = useState<ApplicationsByJob>({});
    const [loading, setLoading] = useState(true);
    const [applicationsLoaded, setApplicationsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setHasError(false);
        setApplicationsLoaded(false);

        try {
            const recruiterJobs = await getMyJobs();
            setJobs(recruiterJobs);

            if (recruiterJobs.length === 0) {
                setApplicationsByJob({});
                setApplicationsLoaded(true);
                setLoading(false);
                return;
            }

            const applicationResults = await Promise.allSettled(
                recruiterJobs.map((job) => getApplicationsWithCandidate(job.id))
            );
            const nextApplications: ApplicationsByJob = {};
            let allApplicationsLoaded = true;

            applicationResults.forEach((result, index) => {
                if (result.status === "fulfilled") {
                    nextApplications[recruiterJobs[index].id] = result.value;
                } else {
                    allApplicationsLoaded = false;
                }
            });

            setApplicationsByJob(nextApplications);
            setApplicationsLoaded(allApplicationsLoaded);
            setHasError(!allApplicationsLoaded);
        } catch (error) {
            console.error("Failed to load recruiter dashboard:", error);
            setJobs(null);
            setApplicationsByJob({});
            setHasError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    const allApplications = useMemo(
        () => Object.values(applicationsByJob).flat(),
        [applicationsByJob]
    );

    const publishedJobs = jobs?.filter((job) => job.status === "PUBLISHED").length;
    const needsAttention = applicationsLoaded
        ? allApplications.filter(
            (application) =>
                application.status === "PENDING" ||
                application.status === "REVIEWING"
        ).length
        : null;
    const shortlisted = applicationsLoaded
        ? allApplications.filter((application) => application.status === "SHORTLISTED").length
        : null;

    return (
        <DashboardShell
            eyebrow="Recruiter workspace"
            title={`Good to see you, ${fullName}`}
            description="Keep your openings organised and move the right candidates forward."
            actions={
                <Link to="/recruiter/jobs/create" className="btn btn-primary">
                    <Plus size={17} aria-hidden="true" />
                    Create job
                </Link>
            }
        >
            {hasError && (
                <ErrorState
                    message="Some job or application counts are unavailable. They are shown as a dash instead of an incomplete total."
                    onRetry={() => void loadDashboardData()}
                />
            )}

            <div className="dashboard-metrics">
                <MetricCard
                    label="My jobs"
                    value={loading ? "…" : jobs ? jobs.length : "—"}
                    hint="All job records"
                    icon={<BriefcaseBusiness size={21} />}
                    tone="blue"
                />
                <MetricCard
                    label="Published jobs"
                    value={loading ? "…" : publishedJobs ?? "—"}
                    hint="Visible to candidates"
                    icon={<BriefcaseBusiness size={21} />}
                    tone="green"
                />
                <MetricCard
                    label="Applications"
                    value={loading ? "…" : applicationsLoaded ? allApplications.length : "—"}
                    hint="Across your jobs"
                    icon={<FileText size={21} />}
                    tone="violet"
                />
                <MetricCard
                    label="Needs review"
                    value={loading ? "…" : needsAttention ?? "—"}
                    hint={shortlisted === null ? "Pending or reviewing" : `${shortlisted} shortlisted`}
                    icon={<UsersRound size={21} />}
                    tone="amber"
                />
            </div>

            <SectionCard
                title="Your jobs"
                description="Application counts are loaded per job from the recruiter API."
            >
                {loading && <div className="dashboard-state">Loading jobs and applications…</div>}
                {!loading && jobs === null && (
                    <div className="dashboard-state">Your jobs are unavailable right now.</div>
                )}
                {!loading && jobs && jobs.length === 0 && (
                    <EmptyState
                        title="No jobs created yet"
                        description="Create your first opening to start receiving applications."
                        action={
                            <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm">
                                Create a job
                            </Link>
                        }
                    />
                )}
                {!loading && jobs && jobs.length > 0 && (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th scope="col">Job</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Applications</th>
                                    <th scope="col">Deadline</th>
                                    <th scope="col"><span className="visually-hidden">Action</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td>
                                            <span className="dashboard-primary-cell">{job.title}</span>
                                            <span className="dashboard-secondary-cell">
                                                {job.location || "Location not provided"} · {formatEmploymentType(job.employmentType)}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={job.status} /></td>
                                        <td>
                                            {applicationsByJob[job.id]
                                                ? applicationsByJob[job.id].length
                                                : "—"}
                                        </td>
                                        <td>{formatDate(job.applicationDeadline)}</td>
                                        <td>
                                            <div className="recruiter-job-actions">
                                                <Link
                                                    to={`/recruiter/jobs/${job.id}`}
                                                    className="dashboard-link dashboard-table-action"
                                                >
                                                    <Eye size={15} aria-hidden="true" /> View
                                                </Link>
                                                <Link
                                                    to={`/recruiter/jobs/${job.id}/edit`}
                                                    className="dashboard-link dashboard-table-action"
                                                >
                                                    <Edit3 size={15} aria-hidden="true" /> Edit
                                                </Link>
                                                <Link
                                                    to={`/recruiter/jobs/${job.id}/applications`}
                                                    className="dashboard-link dashboard-table-action"
                                                >
                                                    Review Applications <ArrowRight size={15} aria-hidden="true" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            <p className="dashboard-kpi-note">
                AI match percentages support human review; they should not be used as the only hiring criterion.
            </p>
        </DashboardShell>
    );
};

export default RecruiterDashboard;
