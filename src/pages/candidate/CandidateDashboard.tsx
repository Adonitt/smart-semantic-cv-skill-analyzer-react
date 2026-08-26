import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileCheck2, FileText, Search, UserRound, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";

import { getPublishedJobs } from "../../services/jobService";
import { getMyApplications } from "../../services/applicationService";
import { getMyProfile } from "../../services/userService";
import type { Application } from "../../types/application";
import type { Job } from "../../types/job";
import type { UserDetails } from "../../types/user";
import {
    DashboardShell,
    EmptyState,
    ErrorState,
    formatDate,
    MetricCard,
    ProgressBar,
    SectionCard,
    StatusBadge,
} from "../../components/dashboard/DashboardPrimitives";
import { useLanguage } from "../../i18n/LanguageContext";

interface CandidateDashboardData {
    jobs: Job[] | null;
    applications: Application[] | null;
    profile: UserDetails | null;
}

const CandidateDashboard: React.FC = () => {
    const fullName = localStorage.getItem("fullName") || "Candidate";
    const email = localStorage.getItem("email") || "";
    const { t } = useLanguage();

    const [data, setData] = useState<CandidateDashboardData>({
        jobs: null,
        applications: null,
        profile: null,
    });
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setHasError(false);

        const [jobsResult, applicationsResult, profileResult] =
            await Promise.allSettled([
                getPublishedJobs(),
                getMyApplications(),
                getMyProfile(),
            ]);

        setData({
            jobs:
                jobsResult.status === "fulfilled"
                    ? jobsResult.value
                    : null,
            applications:
                applicationsResult.status === "fulfilled"
                    ? applicationsResult.value
                    : null,
            profile:
                profileResult.status === "fulfilled"
                    ? profileResult.value
                    : null,
        });

        setHasError(
            jobsResult.status === "rejected" ||
                applicationsResult.status === "rejected" ||
                profileResult.status === "rejected"
        );
        setLoading(false);
    }, []);

    useEffect(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    const recentApplications = useMemo(
        () =>
            [...(data.applications || [])]
                .sort(
                    (first, second) =>
                        new Date(second.appliedAt).getTime() -
                        new Date(first.appliedAt).getTime()
                )
                .slice(0, 5),
        [data.applications]
    );

    const profileCompletion = useMemo(() => {
        if (!data.profile) return null;

        const profile = data.profile.candidateProfile;
        const completedFields = [
            Boolean(fullName),
            Boolean(email),
            Boolean(profile?.headline),
            Boolean(profile?.industryDomain),
            Boolean(profile?.cvFilePath),
        ].filter(Boolean).length;

        return Math.round((completedFields / 5) * 100);
    }, [data.profile, email, fullName]);

    const activeApplications = data.applications?.filter(
        (application) =>
            application.status !== "ACCEPTED" &&
            application.status !== "REJECTED"
    ).length;

    return (
        <DashboardShell
            eyebrow={t("candidate.workspace")}
            title={t("candidate.welcome", { name: fullName })}
            description={t("candidate.dashboardDescription")}
            actions={
                <Link to="/candidate/jobs" className="btn btn-primary">
                    <Search size={17} aria-hidden="true" />
                    {t("candidate.findJobs")}
                </Link>
            }
        >
            {hasError && (
                <ErrorState
                    message="Some values are temporarily unavailable. A dash means the API did not return that value; it is not treated as zero."
                    onRetry={() => void loadDashboardData()}
                />
            )}

            <div className="dashboard-metrics">
                <MetricCard
                    label={t("candidate.availableJobs")}
                    value={loading ? "…" : data.jobs ? data.jobs.length : "—"}
                    hint={t("candidate.publishedPositions")}
                    icon={<BriefcaseBusiness size={21} />}
                    tone="blue"
                />
                <MetricCard
                    label={t("candidate.myApplications")}
                    value={
                        loading
                            ? "…"
                            : data.applications
                                ? data.applications.length
                                : "—"
                    }
                    hint={
                        activeApplications === undefined
                            ? t("candidate.submittedApplications")
                            : t("candidate.activeApplications", { count: activeApplications })
                    }
                    icon={<FileText size={21} />}
                    tone="green"
                />
                <MetricCard
                    label={t("candidate.profileCompleteness")}
                    value={
                        loading
                            ? "…"
                            : profileCompletion === null
                                ? "—"
                                : `${profileCompletion}%`
                    }
                    hint={t("candidate.cvProfileDetails")}
                    icon={<UserRound size={21} />}
                    tone="amber"
                />
            </div>

            <div className="dashboard-grid">
                <SectionCard
                    title={t("candidate.recentApplications")}
                    description={t("candidate.recentApplicationsDescription")}
                    actions={
                        <Link to="/candidate/applications" className="dashboard-link">
                            {t("candidate.viewAll")}
                        </Link>
                    }
                >
                    {loading && <div className="dashboard-state">{t("candidate.loadingApplications")}</div>}
                    {!loading && data.applications === null && (
                        <div className="dashboard-state">{t("candidate.applicationsUnavailable")}</div>
                    )}
                    {!loading && data.applications && recentApplications.length === 0 && (
                        <EmptyState
                            title={t("candidate.noApplications")}
                            description={t("candidate.noApplicationsDescription")}
                            action={
                                <Link to="/candidate/jobs" className="btn btn-primary btn-sm">
                                    {t("candidate.browseJobs")}
                                </Link>
                            }
                        />
                    )}
                    {!loading && recentApplications.length > 0 && (
                        <div className="dashboard-table-wrap">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th scope="col">{t("candidate.position")}</th>
                                        <th scope="col">{t("candidate.applied")}</th>
                                        <th scope="col">{t("common.status")}</th>
                                        <th scope="col">{t("candidate.aiMatch")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.map((application) => (
                                        <tr key={application.id}>
                                            <td>
                                                <span className="dashboard-primary-cell">
                                                    {application.jobTitle}
                                                </span>
                                                <span className="dashboard-secondary-cell">
                                                    {application.companyName || t("candidate.companyUnavailable")}
                                                </span>
                                            </td>
                                            <td>{formatDate(application.appliedAt)}</td>
                                            <td><StatusBadge status={application.status} /></td>
                                            <td>
                                                {application.matchPercentage === null ||
                                                application.matchPercentage === undefined
                                                    ? t("candidate.notAvailable")
                                                    : `${application.matchPercentage.toFixed(1)}%`}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>

                <div className="d-grid gap-3">
                    <div className="dashboard-callout">
                        <h2>{t("candidate.profileStronger")}</h2>
                        <p>{t("candidate.profileStrongerDescription")}</p>
                        {profileCompletion === null ? (
                            <div className="dashboard-state">{t("candidate.profileUnavailable")}</div>
                        ) : (
                            <ProgressBar value={profileCompletion} label="Profile completeness" />
                        )}
                        <Link to="/profile" className="btn btn-outline-primary btn-sm mt-3">
                            <FileCheck2 size={16} aria-hidden="true" />
                            {t("candidate.updateProfile")}
                        </Link>
                    </div>

                    <SectionCard title={t("candidate.quickActions")} description={t("candidate.quickActionsDescription")}>
                        <div className="d-grid gap-2 px-3 pb-3">
                            <Link to="/candidate/jobs" className="btn btn-light text-start">
                                <Search size={17} className="me-2" aria-hidden="true" />
                                {t("candidate.searchJobs")}
                            </Link>
                            <Link to="/candidate/applications" className="btn btn-light text-start">
                                <FileText size={17} className="me-2" aria-hidden="true" />
                                {t("candidate.reviewApplications")}
                            </Link>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </DashboardShell>
    );
};

export default CandidateDashboard;
