import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    ExternalLink,
    FileText,
    MapPin,
    Save,
    Search,
    Trash2,
    WalletCards,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
    deleteApplication,
    getMyApplications,
    updateApplicationCoverLetter,
} from "../../services/applicationService";
import { getApplicationCv } from "../../services/cvService";
import type { Application } from "../../types/application";
import {
    DashboardShell,
    EmptyState,
    ErrorState,
    formatDate,
    formatEmploymentType,
    SectionCard,
    StatusBadge,
} from "../../components/dashboard/DashboardPrimitives";
import { useLanguage } from "../../i18n/LanguageContext";

const toList = (value?: string | null) =>
    (value || "")
        .split(/\r?\n|•/)
        .map((item) => item.trim().replace(/^[-*▪◦]\s*/, ""))
        .filter(Boolean);

const formatMoney = (value?: number | null) => {
    if (value === null || value === undefined) {
        return "Not specified";
    }

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    }).format(value);
};

const MyApplications: React.FC = () => {
    const { t } = useLanguage();
    const [applications, setApplications] = useState<Application[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draftCoverLetter, setDraftCoverLetter] = useState("");
    const [actionError, setActionError] = useState("");
    const [savingId, setSavingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [openingCvId, setOpeningCvId] = useState<number | null>(null);

    const loadApplications = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setApplications(await getMyApplications());
        } catch (loadError) {
            console.error("Failed to load applications:", loadError);
            setApplications(null);
            setError(t("candidate.applicationsUnavailable"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void loadApplications();
    }, [loadApplications]);

    const sortedApplications = useMemo(
        () =>
            [...(applications || [])].sort(
                (first, second) =>
                    new Date(second.appliedAt).getTime() -
                    new Date(first.appliedAt).getTime()
            ),
        [applications]
    );

    const handleToggleDetails = (application: Application) => {
        const nextId = expandedId === application.id ? null : application.id;
        setExpandedId(nextId);
        setEditingId(null);
        setDraftCoverLetter(application.coverLetter || "");
        setActionError("");
    };

    const handleEditCoverLetter = (application: Application) => {
        setExpandedId(application.id);
        setEditingId(application.id);
        setDraftCoverLetter(application.coverLetter || "");
        setActionError("");
    };

    const handleSaveCoverLetter = async (event: React.FormEvent) => {
        event.preventDefault();

        if (editingId === null || !draftCoverLetter.trim()) {
            setActionError(t("candidate.saveCoverLetterHelp"));
            return;
        }

        setSavingId(editingId);
        setActionError("");

        try {
            const updated = await updateApplicationCoverLetter(
                editingId,
                draftCoverLetter.trim()
            );

            setApplications((current) =>
                current
                    ? current.map((application) =>
                        application.id === updated.id ? updated : application
                    )
                    : current
            );
            setDraftCoverLetter(updated.coverLetter || "");
            setEditingId(null);
        } catch (saveError) {
            console.error("Failed to update cover letter:", saveError);
            setActionError(
                t("candidate.saveCoverLetterError")
            );
        } finally {
            setSavingId(null);
        }
    };

    const handleDelete = async (application: Application) => {
        if (!window.confirm(t("candidate.deleteConfirm"))) {
            return;
        }

        setDeletingId(application.id);
        setActionError("");

        try {
            await deleteApplication(application.id);
            setApplications((current) =>
                current
                    ? current.filter((item) => item.id !== application.id)
                    : current
            );
            setExpandedId(null);
            setEditingId(null);
        } catch (deleteError) {
            console.error("Failed to delete application:", deleteError);
            setActionError(
                t("candidate.deleteError")
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenCv = async (application: Application) => {
        const cvWindow = window.open("about:blank", "_blank");
        setOpeningCvId(application.id);
        setActionError("");

        try {
            const blob = await getApplicationCv(application.id);
            const url = URL.createObjectURL(blob);

            if (cvWindow) {
                cvWindow.location.href = url;
            } else {
                window.open(url, "_blank", "noopener,noreferrer");
            }

            window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (cvError) {
            console.error("Failed to open application CV:", cvError);
            cvWindow?.close();
            setActionError(t("candidate.openCv"));
        } finally {
            setOpeningCvId(null);
        }
    };

    return (
        <DashboardShell
            eyebrow={t("candidate.workspace")}
            title={t("candidate.myApplications")}
            description={t("candidate.applicationHistoryDescription")}
            actions={
                <Link to="/candidate/jobs" className="btn btn-primary">
                    <Search size={17} aria-hidden="true" />
                    {t("candidate.browseJobs")}
                </Link>
            }
        >
            {error && <ErrorState message={error} onRetry={() => void loadApplications()} />}
            {actionError && <div className="application-action-alert" role="alert">{actionError}</div>}

            <SectionCard title={t("candidate.applicationHistory")} description={t("candidate.applicationHistoryDescription")}>
                {loading && <div className="dashboard-state">{t("candidate.loadingApplications")}</div>}
                {!loading && applications && applications.length === 0 && (
                    <EmptyState
                        title={t("candidate.noApplications")}
                        description={t("candidate.findRole")}
                        action={
                            <Link to="/candidate/jobs" className="btn btn-primary btn-sm">
                                <Search size={15} aria-hidden="true" />
                                {t("candidate.findJob")}
                            </Link>
                        }
                    />
                )}
                {!loading && applications && applications.length > 0 && (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table applications-table">
                            <thead>
                                <tr>
                                    <th scope="col">{t("candidate.position")}</th>
                                    <th scope="col">{t("candidate.applied")}</th>
                                    <th scope="col">{t("common.status")}</th>
                                    <th scope="col">{t("candidate.aiMatch")}</th>
                                    <th scope="col">{t("candidate.skills")}</th>
                                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedApplications.map((application) => {
                                    const job = application.jobDetails;
                                    const requirements = toList(job?.requirements);
                                    const skills = job?.skillRequirements?.length
                                        ? job.skillRequirements.map((skill) => skill.name)
                                        : toList(job?.skills?.replace(/[,;]+/g, "\n"));
                                    const canModify = application.status === "PENDING";
                                    const isExpanded = expandedId === application.id;

                                    return (
                                        <React.Fragment key={application.id}>
                                            <tr>
                                                <td>
                                                    <span className="dashboard-primary-cell">{application.jobTitle}</span>
                                                    <span className="dashboard-secondary-cell">
                                                        {application.companyName || job?.companyName || t("candidate.companyUnavailable")}
                                                    </span>
                                                </td>
                                                <td>{formatDate(application.appliedAt)}</td>
                                                <td><StatusBadge status={application.status} /></td>
                                                <td>
                                                    {application.matchPercentage === null ||
                                                    application.matchPercentage === undefined
                                                        ? "Not available"
                                                        : `${application.matchPercentage.toFixed(1)}%`}
                                                </td>
                                                <td>
                                                    {application.matchedSkills?.length
                                                        ? `${application.matchedSkills.length} matched`
                                                        : "Not available"}
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="dashboard-link dashboard-table-action"
                                                        aria-expanded={isExpanded}
                                                        onClick={() => handleToggleDetails(application)}
                                                    >
                                                        {isExpanded ? t("common.close") : t("common.view")}
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="application-detail-row">
                                                    <td colSpan={6}>
                                                        <div className="application-detail-panel">
                                                            <div className="application-detail-heading">
                                                                <div>
                                                                    <span className="application-detail-kicker">{t("candidate.applicationSnapshot")}</span>
                                                                    <h3>{job?.title || application.jobTitle}</h3>
                                                                    <p>
                                                                         {t("candidate.submitted", { date: formatDate(application.appliedAt) })}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="application-detail-close"
                                                                     aria-label={t("common.close")}
                                                                    onClick={() => setExpandedId(null)}
                                                                >
                                                                    <X size={17} aria-hidden="true" />
                                                                </button>
                                                            </div>

                                                            <div className="application-detail-grid">
                                                                <section className="application-detail-section">
                                                                    <div className="application-detail-section-title">
                                                                        <BriefcaseBusiness size={16} aria-hidden="true" />
                                                                         <h4>{t("candidate.jobDetails")}</h4>
                                                                    </div>
                                                                    <p className="application-detail-copy">
                                                                         {job?.description || t("candidate.notAvailable")}
                                                                    </p>
                                                                    {requirements.length > 0 && (
                                                                        <div className="application-detail-block">
                                                                             <strong>{t("candidate.requirements")}</strong>
                                                                            <ul>
                                                                                {requirements.map((requirement, index) => (
                                                                                    <li key={`${requirement}-${index}`}>{requirement}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    {skills.length > 0 && (
                                                                        <div className="application-detail-block">
                                                                             <strong>{t("candidate.skills")}</strong>
                                                                            <div className="application-detail-pills">
                                                                                {skills.map((skill, index) => (
                                                                                    <span key={`${skill}-${index}`}>{skill}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="application-detail-facts">
                                                                         <span><MapPin size={14} aria-hidden="true" />{job?.location || t("candidate.notAvailable")}</span>
                                                                        <span><BriefcaseBusiness size={14} aria-hidden="true" />{formatEmploymentType(job?.employmentType)}</span>
                                                                        <span><WalletCards size={14} aria-hidden="true" />{formatMoney(job?.salaryMin)} – {formatMoney(job?.salaryMax)}</span>
                                                                         <span><CalendarDays size={14} aria-hidden="true" />{t("candidate.deadline")}: {formatDate(job?.applicationDeadline)}</span>
                                                                    </div>
                                                                </section>

                                                                <section className="application-detail-section application-submission-section">
                                                                    <div className="application-detail-section-title">
                                                                        <FileText size={16} aria-hidden="true" />
                                                                         <h4>{t("candidate.yourSubmission")}</h4>
                                                                    </div>
                                                                    <div className="application-match-summary">
                                                                         <span>{t("candidate.matchAtApplication")}</span>
                                                                        <strong>
                                                                            {application.matchPercentage === null || application.matchPercentage === undefined
                                                                                 ? t("candidate.notAvailable")
                                                                                : `${application.matchPercentage.toFixed(1)}%`}
                                                                        </strong>
                                                                    </div>

                                                                    {editingId === application.id ? (
                                                                        <form onSubmit={handleSaveCoverLetter}>
                                                                            <label className="application-detail-label" htmlFor={`cover-letter-${application.id}`}>
                                                                                 {t("candidate.coverLetter")}
                                                                            </label>
                                                                            <textarea
                                                                                id={`cover-letter-${application.id}`}
                                                                                className="form-control application-cover-letter-editor"
                                                                                value={draftCoverLetter}
                                                                                maxLength={5000}
                                                                                onChange={(event) => setDraftCoverLetter(event.target.value)}
                                                                            />
                                                                            <p className="application-detail-hint">{draftCoverLetter.length}/5000 characters</p>
                                                                            <div className="application-detail-actions">
                                                                                <button type="submit" className="btn btn-primary btn-sm" disabled={savingId === application.id}>
                                                                                    <Save size={15} aria-hidden="true" />
                                                                                    {savingId === application.id ? t("security.saving") : t("common.saveChanges")}
                                                                                </button>
                                                                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingId(null)}>
                                                                                     {t("common.cancel")}
                                                                                </button>
                                                                            </div>
                                                                        </form>
                                                                    ) : (
                                                                        <>
                                                                            <div className="application-cover-letter">
                                                                                 <span>{t("candidate.coverLetter")}</span>
                                                                                 <p>{application.coverLetter || t("candidate.noCoverLetter")}</p>
                                                                            </div>
                                                                            {canModify && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-outline-primary btn-sm application-edit-button"
                                                                                    onClick={() => handleEditCoverLetter(application)}
                                                                                >
                                                                                     {t("candidate.editCoverLetter")}
                                                                                </button>
                                                                            )}
                                                                        </>
                                                                    )}

                                                                    <div className="application-cv-actions">
                                                                        <div>
                                                                             <strong>{t("candidate.cvUsed")}</strong>
                                                                            <span>
                                                                                {application.cvSnapshotAvailable
                                                                                     ? t("candidate.savedSnapshot")
                                                                                     : t("candidate.oldSnapshot")}
                                                                            </span>
                                                                        </div>
                                                                        {application.cvSnapshotAvailable ? (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-light btn-sm"
                                                                                disabled={openingCvId === application.id}
                                                                                onClick={() => void handleOpenCv(application)}
                                                                            >
                                                                                <ExternalLink size={15} aria-hidden="true" />
                                                                                 {openingCvId === application.id ? t("common.loading") : t("candidate.openCv")}
                                                                            </button>
                                                                        ) : (
                                                                             <span className="application-detail-hint">{t("candidate.noPreservedCv")}</span>
                                                                        )}
                                                                    </div>

                                                                    {canModify && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-danger btn-sm application-delete-button"
                                                                            disabled={deletingId === application.id}
                                                                            onClick={() => void handleDelete(application)}
                                                                        >
                                                                            <Trash2 size={15} aria-hidden="true" />
                                                                            {deletingId === application.id ? t("common.loading") : t("candidate.deleteApplication")}
                                                                        </button>
                                                                    )}
                                                                    {!canModify && (
                                                                        <p className="application-detail-hint application-locked-note">
                                                                             {t("candidate.lockedApplication")}
                                                                        </p>
                                                                    )}
                                                                </section>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            <p className="dashboard-kpi-note d-flex align-items-center gap-2">
                <CheckCircle2 size={15} aria-hidden="true" />
                {t("candidate.informationalMatch")}
            </p>

            <Link to="/candidate/dashboard" className="dashboard-link d-inline-flex align-items-center gap-1 mt-2">
                <ArrowLeft size={15} aria-hidden="true" />
                {t("candidate.backToDashboard")}
            </Link>
        </DashboardShell>
    );
};

export default MyApplications;
