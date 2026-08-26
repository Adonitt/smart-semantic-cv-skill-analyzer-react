import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, ChevronLeft, ChevronRight, Edit3, Eye, FileText, Plus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { getApplicationsWithCandidate } from "../../services/applicationService";
import { getMyJobsPage } from "../../services/jobService";
import type { Application } from "../../types/application";
import type { Job, JobPage } from "../../types/job";
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
import { useLanguage } from "../../i18n/LanguageContext";

type ApplicationsByJob = Record<number, Application[]>;

const getPageNumbers = (currentPage: number, totalPages: number) => {
    const visiblePages = Math.min(totalPages, 7);
    if (visiblePages === totalPages) {
        return Array.from({ length: visiblePages }, (_, index) => index);
    }

    if (currentPage <= 3) return [0, 1, 2, 3, 4, 5, 6];
    if (currentPage >= totalPages - 4) {
        return Array.from({ length: 7 }, (_, index) => totalPages - 7 + index);
    }

    return Array.from({ length: 7 }, (_, index) => currentPage - 3 + index);
};

const RecruiterDashboard: React.FC = () => {
    const fullName = localStorage.getItem("fullName") || "Recruiter";
    const { t } = useLanguage();
    const [jobs, setJobs] = useState<Job[] | null>(null);
    const [pagination, setPagination] = useState<JobPage | null>(null);
    const [applicationsByJob, setApplicationsByJob] = useState<ApplicationsByJob>({});
    const [loading, setLoading] = useState(true);
    const [applicationsLoaded, setApplicationsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 5;

    const loadDashboardData = useCallback(async (page = 0) => {
        setLoading(true);
        setHasError(false);
        setApplicationsLoaded(false);

        try {
            const recruiterJobsPage = await getMyJobsPage({
                page,
                size: pageSize,
            });
            const recruiterJobs = recruiterJobsPage.content;
            setJobs(recruiterJobs);
            setPagination(recruiterJobsPage);
            setCurrentPage(recruiterJobsPage.number);

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
            eyebrow={t("recruiter.workspace")}
            title={t("recruiter.greeting", { name: fullName })}
            description={t("recruiter.dashboardDescription")}
            actions={
                <Link to="/recruiter/jobs/create" className="btn btn-primary">
                    <Plus size={17} aria-hidden="true" />
                    {t("recruiter.createJob")}
                </Link>
            }
        >
            {hasError && (
                <ErrorState
                    message="Some job or application counts are unavailable. They are shown as a dash instead of an incomplete total."
                    onRetry={() => void loadDashboardData(currentPage)}
                />
            )}

            <div className="dashboard-metrics">
                <MetricCard
                    label={t("recruiter.myJobs")}
                    value={loading ? "…" : pagination ? pagination.totalElements : "—"}
                    hint={t("recruiter.allJobRecords")}
                    icon={<BriefcaseBusiness size={21} />}
                    tone="blue"
                />
                <MetricCard
                    label={t("recruiter.publishedJobs")}
                    value={loading ? "…" : publishedJobs ?? "—"}
                    hint={t("recruiter.visibleCandidates")}
                    icon={<BriefcaseBusiness size={21} />}
                    tone="green"
                />
                <MetricCard
                    label={t("recruiter.applications")}
                    value={loading ? "…" : applicationsLoaded ? allApplications.length : "—"}
                    hint={t("recruiter.acrossJobs")}
                    icon={<FileText size={21} />}
                    tone="violet"
                />
                <MetricCard
                    label={t("recruiter.needsReview")}
                    value={loading ? "…" : needsAttention ?? "—"}
                    hint={shortlisted === null ? t("recruiter.pendingReviewing") : t("recruiter.shortlisted", { count: shortlisted })}
                    icon={<UsersRound size={21} />}
                    tone="amber"
                />
            </div>

            <SectionCard
                title={t("recruiter.yourJobs")}
                description={t("recruiter.applicationCounts")}
            >
                {loading && <div className="dashboard-state">{t("recruiter.loadingJobs")}</div>}
                {!loading && jobs === null && (
                    <div className="dashboard-state">{t("recruiter.jobsUnavailable")}</div>
                )}
                {!loading && jobs && jobs.length === 0 && (
                    <EmptyState
                        title={t("recruiter.noJobs")}
                        description={t("recruiter.noJobsDescription")}
                        action={
                            <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm">
                                {t("recruiter.createAJob")}
                            </Link>
                        }
                    />
                )}
                {!loading && jobs && jobs.length > 0 && (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th scope="col">{t("recruiter.job")}</th>
                                    <th scope="col">{t("recruiter.status")}</th>
                                    <th scope="col">{t("recruiter.applicationCount")}</th>
                                    <th scope="col">{t("recruiter.deadline")}</th>
                                    <th scope="col"><span className="visually-hidden">Action</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td>
                                            <span className="dashboard-primary-cell">{job.title}</span>
                                            <span className="dashboard-secondary-cell">
                                                    {job.location || t("job.locationUnavailable")} · {formatEmploymentType(job.employmentType)}
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
                                                    <Eye size={15} aria-hidden="true" /> {t("recruiter.view")}
                                                </Link>
                                                <Link
                                                    to={`/recruiter/jobs/${job.id}/edit`}
                                                    className="dashboard-link dashboard-table-action"
                                                >
                                                    <Edit3 size={15} aria-hidden="true" /> {t("recruiter.edit")}
                                                </Link>
                                                <Link
                                                    to={`/recruiter/jobs/${job.id}/applications`}
                                                    className="dashboard-link dashboard-table-action"
                                                >
                                                    {t("recruiter.reviewApplications")} <ArrowRight size={15} aria-hidden="true" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && jobs && jobs.length > 0 && pagination && pagination.totalPages > 0 && (
                    <div className="recruiter-list-pagination">
                        <span className="recruiter-list-pagination-summary">
                            {pagination.number * pagination.size + 1}–{Math.min(
                                (pagination.number + 1) * pagination.size,
                                pagination.totalElements
                            )} / {pagination.totalElements}
                        </span>
                        <div className="recruiter-list-pagination-controls" aria-label={t("recruiter.jobsPagination")}>
                            <button
                                type="button"
                                className="admin-page-button"
                                onClick={() => void loadDashboardData(currentPage - 1)}
                                disabled={pagination.first}
                                aria-label={t("recruiter.previousPage")}
                            >
                                <ChevronLeft size={15} aria-hidden="true" />
                            </button>
                            {getPageNumbers(currentPage, pagination.totalPages).map((page) => (
                                <button
                                    type="button"
                                    key={page}
                                    className={`admin-page-button ${page === currentPage ? "active" : ""}`}
                                    onClick={() => void loadDashboardData(page)}
                                    aria-current={page === currentPage ? "page" : undefined}
                                >
                                    {page + 1}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="admin-page-button"
                                onClick={() => void loadDashboardData(currentPage + 1)}
                                disabled={pagination.last}
                                aria-label={t("recruiter.nextPage")}
                            >
                                <ChevronRight size={15} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                )}
            </SectionCard>

            <p className="dashboard-kpi-note">
                {t("recruiter.aiNote")}
            </p>
        </DashboardShell>
    );
};

export default RecruiterDashboard;
