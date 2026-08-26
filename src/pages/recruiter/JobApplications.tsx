import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ExternalLink,
    FileText,
    Search,
    Sparkles,
    UsersRound,
    XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getApplicationsWithCandidatePage,
    updateApplicationStatus,
} from "../../services/applicationService";
import { getApplicationCv } from "../../services/cvService";
import { getMyJobById } from "../../services/jobService";
import type { Application, ApplicationPage, ApplicationStatus } from "../../types/application";
import type { Job, JobSkill } from "../../types/job";
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

const APPLICATION_STATUSES: ApplicationStatus[] = [
    "PENDING",
    "REVIEWING",
    "SHORTLISTED",
    "ACCEPTED",
    "REJECTED",
];

type ApplicationFilter = "ALL" | ApplicationStatus;

const statusLabel = (status: string) =>
    status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

const formatScore = (value?: number | null) =>
    value === null || value === undefined || Number.isNaN(value)
        ? "—"
        : `${value.toFixed(1)}%`;

const getJobSkills = (job?: Job | null): JobSkill[] => {
    if (!job) return [];

    if (job.skillRequirements?.length) {
        return job.skillRequirements;
    }

    return (job.skills || "")
        .split(/[,;\n]+/)
        .map((name, index) => ({
            name: name.trim(),
            importance: "IMPORTANT" as const,
            displayOrder: index,
        }))
        .filter((skill) => skill.name);
};

const getRequirements = (requirements?: string | null): string[] =>
    (requirements || "")
        .split(/\r?\n|•/)
        .map((item) => item.trim().replace(/^[-*▪◦]\s*/, ""))
        .filter(Boolean);

const uniqueSkills = (values: Array<string | null | undefined>) =>
    Array.from(
        new Map(
            values
                .filter((value): value is string => Boolean(value?.trim()))
                .map((value) => [value.trim().toLowerCase(), value.trim()])
        ).values()
    );

const hasSkill = (skills: string[] | null | undefined, value: string) =>
    Boolean(skills?.some((skill) => skill.trim().toLowerCase() === value.trim().toLowerCase()));

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

const JobApplications: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const localizedStatusLabel = (status: string) => {
        const key = status.toLowerCase().replace("_", "");
        const translations: Record<string, string> = {
            pending: t("status.pending"),
            reviewing: t("status.reviewing"),
            shortlisted: t("status.shortlisted"),
            accepted: t("status.accepted"),
            rejected: t("status.rejected"),
            matched: t("status.matched"),
            related: t("status.related"),
            missing: t("status.missing"),
            reviewed: t("status.reviewed"),
            musthave: t("recruiter.mustHave"),
            important: t("recruiter.important"),
            nicetohave: t("recruiter.niceToHave"),
        };
        return translations[key] || statusLabel(status);
    };
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[] | null>(null);
    const [pagination, setPagination] = useState<ApplicationPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [openingCvId, setOpeningCvId] = useState<number | null>(null);
    const [applicationFilter, setApplicationFilter] = useState<ApplicationFilter>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const loadJob = useCallback(async () => {
        if (!jobId) {
            setError(t("recruiter.jobsUnavailable"));
            return;
        }

        setError("");

        try {
            setJob(await getMyJobById(Number(jobId)));
        } catch (loadError) {
            console.error("Failed to load job applications:", loadError);
            setError(t("recruiter.applicationsDescription"));
        }
    }, [jobId, t]);

    const loadApplications = useCallback(async (page = 0) => {
        if (!jobId) return;

        setLoading(true);
        setError("");

        try {
            const result = await getApplicationsWithCandidatePage(Number(jobId), {
                page,
                size: pageSize,
                search: searchTerm.trim(),
                status: applicationFilter === "ALL" ? undefined : applicationFilter,
            });
            setApplications(result.content);
            setPagination(result);
            setCurrentPage(result.number);
        } catch (loadError) {
            console.error("Failed to load job applications:", loadError);
            setApplications(null);
            setPagination(null);
            setError(t("recruiter.applicationsDescription"));
        } finally {
            setLoading(false);
        }
    }, [applicationFilter, jobId, pageSize, searchTerm, t]);

    useEffect(() => {
        void loadJob();
    }, [loadJob]);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadApplications(0), 250);
        return () => window.clearTimeout(timer);
    }, [loadApplications]);

    const filteredApplications = useMemo(() => applications || [], [applications]);

    useEffect(() => {
        if (!filteredApplications.length) {
            setSelectedId(null);
            return;
        }

        if (!filteredApplications.some((application) => application.id === selectedId)) {
            setSelectedId(filteredApplications[0].id);
        }
    }, [filteredApplications, selectedId]);

    const selectedApplication = applications?.find(
        (application) => application.id === selectedId
    );

    const handleStatusChange = async (
        applicationId: number,
        status: ApplicationStatus
    ) => {
        setUpdatingId(applicationId);
        setError("");

        try {
            await updateApplicationStatus(applicationId, status);
            await loadApplications(currentPage);
        } catch (updateError) {
            console.error("Failed to update application status:", updateError);
            setError(t("common.tryAgain"));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleOpenCv = async (applicationId: number) => {
        const cvWindow = window.open("about:blank", "_blank");
        setOpeningCvId(applicationId);
        setError("");

        try {
            const blob = await getApplicationCv(applicationId);
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

    const jobSkills = getJobSkills(job);
    const requirements = getRequirements(job?.requirements);
    const selectedCvSkills = selectedApplication
        ? uniqueSkills([
            ...(selectedApplication.candidateSkills || []),
            ...(selectedApplication.matchedSkills || []),
            ...(selectedApplication.relatedSkills || []),
        ])
        : [];
    const selectedRequiredSkills = selectedApplication?.requiredSkills?.length
        ? selectedApplication.requiredSkills
        : jobSkills.map((skill) => skill.name);
    const selectedMatchedSkills = selectedApplication?.matchedSkills || [];
    const selectedRelatedSkills = selectedApplication?.relatedSkills || [];
    const selectedMissingSkills = selectedApplication?.missingSkills || [];
    const skillEvidence = selectedApplication?.skillEvidence || {};
    const skillScores = selectedApplication?.skillScores || {};
    const skillRows = uniqueSkills([
        ...selectedRequiredSkills,
        ...Object.keys(skillScores),
        ...Object.keys(skillEvidence),
    ]).map((skill) => {
        const jobSkill = jobSkills.find(
            (item) => item.name.trim().toLowerCase() === skill.trim().toLowerCase()
        );
        const score = Object.entries(skillScores).find(
            ([name]) => name.trim().toLowerCase() === skill.trim().toLowerCase()
        )?.[1];
        const matchType = Object.entries(selectedApplication?.skillMatchTypes || {}).find(
            ([name]) => name.trim().toLowerCase() === skill.trim().toLowerCase()
        )?.[1];
        const status = hasSkill(selectedMatchedSkills, skill)
            ? "Matched"
            : hasSkill(selectedRelatedSkills, skill)
                ? "Related"
                : hasSkill(selectedMissingSkills, skill)
                    ? "Missing"
                    : matchType || "Reviewed";

        return {
            name: skill,
            importance: jobSkill?.importance || selectedApplication?.skillImportance?.[skill],
            score,
            status,
            evidence: skillEvidence[skill],
        };
    });

    return (
        <DashboardShell
            eyebrow={t("recruiter.candidateProfile")}
            title={job?.title || t("recruiter.applicationsTitle")}
            description={
                job
                    ? `${job.companyName || t("recruiter.company")} · ${applications?.length ?? 0} ${t("recruiter.applications")}`
                    : t("recruiter.applicationsDescription")
            }
            actions={
                <div className="d-flex flex-wrap gap-2">
                    <Link to={`/recruiter/jobs/${jobId || ""}`} className="btn btn-outline-secondary">
                        <BriefcaseBusiness size={16} aria-hidden="true" />
                        {t("recruiter.jobDetails")}
                    </Link>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/recruiter/jobs")}
                    >
                        <ArrowLeft size={17} aria-hidden="true" />
                        {t("recruiter.backToJobs")}
                    </button>
                </div>
            }
        >
            {error && <ErrorState message={error} onRetry={() => void loadApplications(currentPage)} />}

            <div className="dashboard-metrics">
                <MetricCard
                    label={t("recruiter.applications")}
                    value={loading ? "…" : pagination ? pagination.totalElements : "—"}
                    hint={t("recruiter.forThisJob")}
                    icon={<UsersRound size={21} />}
                    tone="blue"
                />
                <MetricCard
                    label={t("recruiter.needsReview")}
                    value={loading ? "…" : applications ? applications.filter((application) => application.status === "PENDING" || application.status === "REVIEWING").length : "—"}
                    hint={t("recruiter.pendingReviewing")}
                    icon={<FileText size={21} />}
                    tone="amber"
                />
                <MetricCard
                    label={t("recruiter.shortlisted", { count: applications ? applications.filter((application) => application.status === "SHORTLISTED").length : 0 })}
                    value={loading ? "…" : applications ? applications.filter((application) => application.status === "SHORTLISTED").length : "—"}
                    hint={t("recruiter.readyNextStep")}
                    icon={<CheckCircle2 size={21} />}
                    tone="green"
                />
            </div>

            <SectionCard
                className="recruiter-application-job-card"
                title={t("recruiter.openingSummary")}
                description={t("recruiter.openingSummaryDescription")}
            >
                <div className="recruiter-application-job-summary">
                    <div>
                        <strong>{job?.title || t("recruiter.jobDetails")}</strong>
                        <span>{job?.location || t("job.locationUnavailable")} · {formatEmploymentType(job?.employmentType)}</span>
                    </div>
                    <div className="recruiter-application-job-summary-facts">
                        <span><b>{t("recruiter.deadline")}</b>{formatDate(job?.applicationDeadline)}</span>
                        <span><b>{t("recruiter.status")}</b><StatusBadge status={job?.status || "DRAFT"} /></span>
                    </div>
                </div>
                <div className="recruiter-application-job-content">
                    <div>
                        <h3>{t("recruiter.roleOverview")}</h3>
                        <p>{job?.description || t("job.noDescription")}</p>
                    </div>
                    <div>
                        <h3>{t("recruiter.requiredSkills")}</h3>
                        <div className="recruiter-application-skill-chips">
                            {jobSkills.length ? jobSkills.map((skill) => (
                                <span className={`recruiter-application-skill-chip ${skill.importance.toLowerCase()}`} key={skill.name}>
                                    {skill.name}
                                    <small>{localizedStatusLabel(skill.importance)}</small>
                                </span>
                            )) : <span className="dashboard-secondary-cell">{t("recruiter.noSkills")}</span>}
                        </div>
                    </div>
                </div>
                {requirements.length > 0 && (
                    <div className="recruiter-application-requirements">
                        <h3>{t("recruiter.requirements")}</h3>
                        <ul>
                            {requirements.slice(0, 4).map((requirement) => <li key={requirement}>{requirement}</li>)}
                        </ul>
                    </div>
                )}
            </SectionCard>

            <SectionCard
                title={t("recruiter.applications")}
                description={t("recruiter.filterQueueDescription")}
            >
                <div className="recruiter-application-toolbar">
                    <div className="recruiter-application-search">
                        <Search size={16} aria-hidden="true" />
                        <label className="visually-hidden" htmlFor="application-search">{t("recruiter.searchCandidates")}</label>
                        <input
                            id="application-search"
                            type="search"
                            placeholder={t("recruiter.searchCandidatePlaceholder")}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>
                    <label className="recruiter-application-filter-label" htmlFor="application-status-filter">{t("recruiter.status")}</label>
                    <select
                        id="application-status-filter"
                        className="form-select form-select-sm recruiter-application-filter"
                        value={applicationFilter}
                        onChange={(event) => setApplicationFilter(event.target.value as ApplicationFilter)}
                    >
                        <option value="ALL">{t("recruiter.allStatuses")}</option>
                        {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{localizedStatusLabel(status)}</option>)}
                    </select>
                    <span className="recruiter-application-result-count">{t("recruiter.shown", { count: pagination?.totalElements ?? filteredApplications.length })}</span>
                </div>

                {loading && <div className="dashboard-state">{t("recruiter.loadingApplications")}</div>}
                {!loading && pagination && pagination.totalElements === 0 && !searchTerm.trim() && applicationFilter === "ALL" && (
                    <EmptyState
                        title={t("recruiter.noApplications")}
                        description={t("recruiter.noApplicationsDescription")}
                    />
                )}
                {!loading && pagination && pagination.totalElements === 0 && (Boolean(searchTerm.trim()) || applicationFilter !== "ALL") && (
                    <EmptyState
                        title={t("recruiter.noMatchingApplications")}
                        description={t("recruiter.noMatchingApplicationsDescription")}
                    />
                )}
                {!loading && filteredApplications.length > 0 && (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table recruiter-applications-table">
                            <thead>
                                <tr>
                                    <th scope="col">{t("recruiter.candidate")}</th>
                                    <th scope="col">{t("candidate.aiMatch")}</th>
                                    <th scope="col">{t("candidate.applied")}</th>
                                    <th scope="col">{t("recruiter.status")}</th>
                                    <th scope="col"><span className="visually-hidden">Review</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map((application) => {
                                    const isSelected = selectedId === application.id;
                                    return (
                                        <tr
                                            className={`recruiter-application-row ${isSelected ? "is-selected" : ""}`}
                                            key={application.id}
                                            tabIndex={0}
                                            aria-selected={isSelected}
                                            onClick={() => setSelectedId(application.id)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    setSelectedId(application.id);
                                                }
                                            }}
                                        >
                                            <td>
                                                <span className="dashboard-primary-cell">{application.candidateFullName || "Candidate"}</span>
                                                <span className="dashboard-secondary-cell">{application.candidateEmail}</span>
                                                {application.headline && <span className="dashboard-secondary-cell">{application.headline}</span>}
                                            </td>
                                            <td>
                                                <span className="recruiter-match-score">{formatScore(application.matchPercentage)}</span>
                                                <span className="dashboard-secondary-cell">{formatScore(application.skillCoverage)} skills</span>
                                            </td>
                                            <td>{formatDate(application.appliedAt)}</td>
                                            <td>
                                                <label className="visually-hidden" htmlFor={`status-${application.id}`}>Status for {application.candidateFullName}</label>
                                                <select
                                                    id={`status-${application.id}`}
                                                    className="form-select form-select-sm"
                                                    value={application.status}
                                                    disabled={updatingId === application.id}
                                                    onChange={(event) => void handleStatusChange(application.id, event.target.value as ApplicationStatus)}
                                                >
                                                    {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{localizedStatusLabel(status)}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <button type="button" className="dashboard-table-action" onClick={() => setSelectedId(application.id)}>
                                                    {isSelected ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
                                                    {isSelected ? t("recruiter.selected") : t("recruiter.review")}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && pagination && pagination.totalElements > 0 && (
                    <div className="recruiter-list-pagination">
                        <span className="recruiter-list-pagination-summary">
                            {pagination.number * pagination.size + 1}–{Math.min(
                                (pagination.number + 1) * pagination.size,
                                pagination.totalElements
                            )} / {pagination.totalElements}
                        </span>
                        <div className="recruiter-list-pagination-controls" aria-label={t("recruiter.applicationsPagination")}>
                            <button
                                type="button"
                                className="admin-page-button"
                                onClick={() => void loadApplications(currentPage - 1)}
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
                                    onClick={() => void loadApplications(page)}
                                    aria-current={page === currentPage ? "page" : undefined}
                                >
                                    {page + 1}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="admin-page-button"
                                onClick={() => void loadApplications(currentPage + 1)}
                                disabled={pagination.last}
                                aria-label={t("recruiter.nextPage")}
                            >
                                <ChevronRight size={15} aria-hidden="true" />
                            </button>
                        </div>
                        <label className="recruiter-list-page-size">
                            <span className="visually-hidden">Rows per page</span>
                            <select
                                value={pageSize}
                                onChange={(event) => setPageSize(Number(event.target.value))}
                            >
                                {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </label>
                    </div>
                )}
            </SectionCard>

            {selectedApplication && (
                <div className="recruiter-application-review-grid">
                    <SectionCard
                        className="recruiter-candidate-card"
                        title={t("recruiter.candidateProfile")}
                        description={t("recruiter.candidateProfileDescription")}
                        actions={
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                disabled={openingCvId === selectedApplication.id || !selectedApplication.cvSnapshotAvailable}
                                onClick={() => void handleOpenCv(selectedApplication.id)}
                            >
                                <ExternalLink size={15} aria-hidden="true" />
                                {openingCvId === selectedApplication.id
                                    ? t("common.loading")
                                    : selectedApplication.cvSnapshotAvailable
                                        ? t("recruiter.viewCv")
                                        : t("recruiter.cvUnavailable")}
                            </button>
                        }
                    >
                        <div className="recruiter-candidate-profile">
                            <div className="recruiter-candidate-avatar" aria-hidden="true">
                                {(selectedApplication.candidateFullName || "C").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3>{selectedApplication.candidateFullName || t("recruiter.candidate")}</h3>
                                <p>{selectedApplication.candidateEmail || t("admin.emailUnavailable")}</p>
                                {selectedApplication.headline && <span>{selectedApplication.headline}</span>}
                                {selectedApplication.industryDomain && <span>{selectedApplication.industryDomain}</span>}
                            </div>
                        </div>
                        <div className="recruiter-candidate-meta">
                            <span><b>{t("recruiter.applicationStatus")}</b><StatusBadge status={selectedApplication.status} /></span>
                            <span><b>{t("candidate.applied")}</b>{formatDate(selectedApplication.appliedAt)}</span>
                            <span><b>{t("admin.cv")}</b>{selectedApplication.cvOriginalFilename || (selectedApplication.cvSnapshotAvailable ? t("recruiter.savedWithApplication") : t("candidate.notAvailable"))}</span>
                        </div>
                        <div className="recruiter-status-actions">
                            <span>{t("recruiter.updateApplicationStatus")}</span>
                            <div>
                                {APPLICATION_STATUSES.map((status) => (
                                    <button
                                        type="button"
                                        key={status}
                                        className={`recruiter-status-action ${selectedApplication.status === status ? "active" : ""}`}
                                        disabled={updatingId === selectedApplication.id || selectedApplication.status === status}
                                        onClick={() => void handleStatusChange(selectedApplication.id, status)}
                                    >
                                        {localizedStatusLabel(status)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {selectedApplication.coverLetter && (
                            <div className="recruiter-cover-letter">
                                <h3>{t("candidate.coverLetter")}</h3>
                                <p>{selectedApplication.coverLetter}</p>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        className="recruiter-match-card"
                        title={t("recruiter.aiMatchOverview")}
                        description={t("recruiter.aiMatchDescription")}
                    >
                        <div className="recruiter-match-overview">
                            <div className="recruiter-match-score-circle">
                                <strong>{formatScore(selectedApplication.matchPercentage)}</strong>
                                <span>{t("recruiter.overallMatch")}</span>
                            </div>
                            <div className="recruiter-match-stat-grid">
                                <span><b>{formatScore(selectedApplication.skillCoverage)}</b>{t("recruiter.skillCoverage")}</span>
                                <span><b>{formatScore(selectedApplication.weightedSkillScore)}</b>{t("recruiter.weightedSkills")}</span>
                                <span><b>{formatScore(selectedApplication.overallSimilarity)}</b>{t("recruiter.semanticFit")}</span>
                            </div>
                        </div>
                        <div className="recruiter-match-groups">
                            <div><h3><Sparkles size={15} aria-hidden="true" />{t("recruiter.skillsFound")}</h3><div className="recruiter-application-skill-chips">{selectedCvSkills.length ? selectedCvSkills.map((skill) => <span className="recruiter-application-skill-chip matched" key={skill}>{skill}</span>) : <span className="dashboard-secondary-cell">{t("candidate.notAvailable")}</span>}</div></div>
                            <div><h3><CheckCircle2 size={15} aria-hidden="true" />{t("recruiter.matchedRequirements")}</h3><div className="recruiter-application-skill-chips">{selectedMatchedSkills.length ? selectedMatchedSkills.map((skill) => <span className="recruiter-application-skill-chip matched" key={skill}>{skill}</span>) : <span className="dashboard-secondary-cell">{t("recruiter.noneReturned")}</span>}</div></div>
                            <div><h3><XCircle size={15} aria-hidden="true" />{t("recruiter.missingRequirements")}</h3><div className="recruiter-application-skill-chips">{selectedMissingSkills.length ? selectedMissingSkills.map((skill) => <span className="recruiter-application-skill-chip missing" key={skill}>{skill}</span>) : <span className="dashboard-secondary-cell">{t("recruiter.noneReturned")}</span>}</div></div>
                        </div>
                        {selectedApplication.candidateLanguages?.length ? <p className="recruiter-match-note"><b>{t("recruiter.languagesDetected")}</b> {selectedApplication.candidateLanguages.join(", ")}</p> : null}
                    </SectionCard>
                </div>
            )}

            {selectedApplication && skillRows.length > 0 && (
                <SectionCard
                    className="recruiter-skill-analysis-card"
                    title={t("recruiter.analysis")}
                    description={t("recruiter.analysisDescription")}
                >
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table recruiter-skill-analysis-table">
                            <thead><tr><th scope="col">{t("recruiter.requiredSkill")}</th><th scope="col">{t("recruiter.importance")}</th><th scope="col">{t("recruiter.result")}</th><th scope="col">{t("recruiter.score")}</th><th scope="col">{t("recruiter.cvEvidence")}</th></tr></thead>
                            <tbody>{skillRows.map((row) => <tr key={row.name}><td><strong>{row.name}</strong></td><td>{row.importance ? localizedStatusLabel(row.importance) : "—"}</td><td><span className={`recruiter-analysis-status ${row.status.toLowerCase()}`}>{localizedStatusLabel(row.status)}</span></td><td>{formatScore(row.score)}</td><td className="recruiter-analysis-evidence">{row.evidence || "—"}</td></tr>)}</tbody>
                        </table>
                    </div>
                </SectionCard>
            )}

            <p className="dashboard-kpi-note">{t("recruiter.aiReviewNote")}</p>
        </DashboardShell>
    );
};

export default JobApplications;
