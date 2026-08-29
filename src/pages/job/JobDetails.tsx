import React, { useMemo, useState } from "react";
import axios from "axios";
import {
    AlertCircle,
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    Check,
    Clock3,
    ExternalLink,
    FileText,
    Languages,
    MapPin,
    Send,
    Sparkles,
    WalletCards,
    X,
} from "lucide-react";

import type { Job, JobSkill } from "../../types/job";
import api from "../../services/api";
import { useLanguage } from "../../i18n/LanguageContext";

interface JobDetailsProps {
    job: Job;
    hasApplied: boolean;
    onApplicationSuccess: (jobId: number) => void;
    onClose: () => void;
}

const importanceTone = (importance?: string) => {
    switch (importance) {
        case "MUST_HAVE":
            return "must-have";
        case "NICE_TO_HAVE":
            return "nice-to-have";
        default:
            return "important";
    }
};

const matchTypeTone = (matchType?: string) => {
    switch (matchType) {
        case "explicit":
        case "canonical":
        case "inferred":
        case "semantic":
            return "matched";
        case "related":
            return "related";
        default:
            return "missing";
    }
};

const cleanListItem = (value: string) =>
    value.trim().replace(/^[-*•▪◦]\s*/, "");

const toList = (value?: string) =>
    (value || "")
        .split(/\r?\n|•/)
        .map(cleanListItem)
        .filter(Boolean);

const getRequiredSkills = (job: Job): JobSkill[] => {
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

const formatMoney = (value?: number | null) => {
    if (value === null || value === undefined) {
        return "Not specified";
    }

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (value?: string | null) => {
    if (!value) {
        return "Not specified";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

const JobDetails: React.FC<JobDetailsProps> = ({
    job,
    hasApplied,
    onApplicationSuccess,
    onClose,
}) => {
    const { t } = useLanguage();
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const localizedImportanceLabel = (importance?: string) => importance === "MUST_HAVE"
        ? t("recruiter.mustHave")
        : importance === "NICE_TO_HAVE"
            ? t("recruiter.niceToHave")
            : t("recruiter.important");
    const localizedMatchTypeLabel = (matchType?: string) => {
        if (matchType === "explicit" || matchType === "canonical" || matchType === "inferred") return t("job.matched");
        if (matchType === "semantic") return t("status.matched");
        if (matchType === "related") return t("job.related");
        return t("job.missing");
    };

    const requiredSkills = useMemo(() => getRequiredSkills(job), [job]);
    const requirementLines = useMemo(
        () => toList(job.requirements),
        [job.requirements]
    );
    const matchPercentage = Math.max(
        0,
        Math.min(100, job.matchPercentage ?? 0)
    );
    const hasScoreBreakdown =
        job.weightedSkillScore !== undefined ||
        job.skillCoverage !== undefined ||
        job.overallSimilarity !== undefined;
    const skillScoreWeight = Math.round(
        (job.skillScoreWeight ??
            (job.scoringMethod === "legacy_semantic_skill" ? 0.75 : 0.9)) *
            100
    );
    const semanticScoreWeight = Math.round(
        (job.semanticScoreWeight ??
            (job.scoringMethod === "legacy_semantic_skill" ? 0.25 : 0.1)) *
            100
    );

    const matchingRows = useMemo(
        () =>
            (job.requiredSkills?.length
                ? job.requiredSkills
                : requiredSkills.map((skill) => skill.name)
            ).map((name) => {
                const configuredSkill = requiredSkills.find(
                    (skill) => skill.name === name
                );

                return {
                    name,
                    importance:
                        job.skillImportance?.[name] ||
                        configuredSkill?.importance,
                    score: job.skillScores?.[name],
                    evidence: job.skillEvidence?.[name],
                    matchType: job.skillMatchTypes?.[name],
                };
            }),
        [job, requiredSkills]
    );

    const today = new Date();
    const todayIso = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
    const deadlineHasPassed = Boolean(
        job.applicationDeadline && job.applicationDeadline < todayIso
    );
    const applicationsClosed = job.status === "CLOSED" || deadlineHasPassed;

    const handleApply = async (event: React.FormEvent) => {
        event.preventDefault();

        if (hasApplied || loading || applicationsClosed) {
            return;
        }

        if (!coverLetter.trim()) {
            setError(t("job.coverLetterRequired"));
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await api.post(`/jobs/${job.id}/apply`, {
                coverLetter: coverLetter.trim(),
            });

            setSuccess(t("job.submittedSuccess"));
            setCoverLetter("");
            onApplicationSuccess(job.id);
        } catch (requestError: unknown) {
            console.error(requestError);

            if (axios.isAxiosError(requestError)) {
                setError(
                    requestError.response?.data?.message ||
                        t("job.submitError")
                );
            } else {
                setError(t("job.submitError"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="job-details-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="job-details-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="job-details-title"
            >
                <div className="job-details-modal">
                    <header className="job-details-hero">
                        <div className="job-details-hero-glow" aria-hidden="true" />
                        <div className="job-details-hero-content">
                            <div className="job-details-eyebrow">
                                <Sparkles size={13} aria-hidden="true" />
                                {t("job.openOpportunity")}
                            </div>
                            <h2 id="job-details-title">{job.title}</h2>
                            <div className="job-details-company">
                                <span className="job-details-company-mark">
                                    <Building2 size={17} aria-hidden="true" />
                                </span>
                                 <span>{job.companyName || t("job.company")}</span>
                            </div>
                            <div className="job-details-hero-meta">
                                <span>
                                    <MapPin size={15} aria-hidden="true" />
                                     {job.location || t("job.locationUnavailable")}
                                </span>
                                <span>
                                    <BriefcaseBusiness size={15} aria-hidden="true" />
                                     {job.employmentType || t("jobs.employmentType")}
                                </span>
                                <span>
                                    <Clock3 size={15} aria-hidden="true" />
                                     {job.experienceLevel || t("job.allExperience")}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="job-details-close"
                             aria-label={t("job.closeDetails")}
                            onClick={onClose}
                        >
                            <X size={20} aria-hidden="true" />
                        </button>
                    </header>

                    <div className="job-details-body">
                        {hasApplied && (
                            <div className="job-details-applied-banner">
                                <span className="job-details-applied-icon">
                                    <CheckCircle2 size={19} aria-hidden="true" />
                                </span>
                                <div>
                                     <strong>{t("job.applicationSubmitted")}</strong>
                                     <p>{t("job.alreadyApplied")}</p>
                                </div>
                                <Check size={17} aria-hidden="true" />
                            </div>
                        )}

                        <div className="job-details-layout">
                            <main className="job-details-main">
                                <section className="job-details-section">
                                    <div className="job-details-section-heading">
                                        <span className="job-details-section-icon blue">
                                            <FileText size={18} aria-hidden="true" />
                                        </span>
                                        <div>
                                             <span className="job-details-section-kicker">{t("job.role")}</span>
                                             <h3>{t("job.description")}</h3>
                                        </div>
                                    </div>
                                    <p className="job-details-copy">
                                         {job.description || t("job.noDescription")}
                                    </p>
                                </section>

                                <section className="job-details-section">
                                    <div className="job-details-section-heading">
                                        <span className="job-details-section-icon violet">
                                            <CheckCircle2 size={18} aria-hidden="true" />
                                        </span>
                                        <div>
                                             <span className="job-details-section-kicker">{t("job.whatNeed")}</span>
                                             <h3>{t("job.requirements")}</h3>
                                        </div>
                                    </div>
                                    {requirementLines.length > 1 ? (
                                        <ul className="job-details-requirements">
                                            {requirementLines.map((requirement, index) => (
                                                <li key={`${requirement}-${index}`}>
                                                    <span><Check size={14} aria-hidden="true" /></span>
                                                    {requirement}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="job-details-copy">
                                             {job.requirements || t("recruiter.requirements")}
                                        </p>
                                    )}
                                </section>

                                <section className="job-details-section">
                                    <div className="job-details-section-heading job-details-section-heading-spaced">
                                        <div>
                                             <span className="job-details-section-kicker">{t("job.recruiterPriorities")}</span>
                                             <h3>{t("job.requiredSkills")}</h3>
                                        </div>
                                         <span className="job-details-count">{t("job.skillCount", { count: requiredSkills.length })}</span>
                                    </div>
                                    <div className="job-details-skill-list">
                                        {requiredSkills.length ? (
                                            requiredSkills.map((skill) => (
                                                <div
                                                    className={`job-details-skill-chip ${importanceTone(skill.importance)}`}
                                                    key={`${skill.name}-${skill.displayOrder}`}
                                                >
                                                    <span className="job-details-skill-dot" />
                                                    <strong>{skill.name}</strong>
                                                    <span>{localizedImportanceLabel(skill.importance)}</span>
                                                </div>
                                            ))
                                        ) : (
                                             <p className="job-details-muted">{t("job.noStructuredSkills")}</p>
                                        )}
                                    </div>
                                </section>

                                {job.matchPercentage !== null && job.matchPercentage !== undefined && (
                                    <section className="job-match-card">
                                        <div className="job-match-heading">
                                            <div>
                                                <div className="job-match-kicker">
                                                    <Sparkles size={15} aria-hidden="true" />
                                                     {t("job.aiCompatibility")}
                                                </div>
                                                 <h3>{t("job.profileFit")}</h3>
                                                 <p>{t("job.profileFitDescription")}</p>
                                            </div>
                                            <div className="job-match-score">
                                                <strong>{matchPercentage.toFixed(0)}%</strong>
                                                 <span>{t("job.match")}</span>
                                            </div>
                                        </div>

                                        <div
                                            className="job-match-progress"
                                            role="progressbar"
                                             aria-label={t("job.profileMatchScore")}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={matchPercentage}
                                        >
                                            <span style={{ width: `${matchPercentage}%` }} />
                                        </div>

                                        {hasScoreBreakdown && (
                                            <div className="job-score-breakdown">
                                                <div className="job-score-metric">
                                                     <span>{t("job.weightedSkillScore")}</span>
                                                    <strong>{Math.round(job.weightedSkillScore ?? 0)}%</strong>
                                                </div>
                                                <div className="job-score-metric">
                                                     <span>{t("job.skillCoverage")}</span>
                                                    <strong>{Math.round(job.skillCoverage ?? 0)}%</strong>
                                                </div>
                                                <div className="job-score-metric">
                                                     <span>{t("job.semanticSimilarity")}</span>
                                                    <strong>{Math.round(job.overallSimilarity ?? 0)}%</strong>
                                                </div>
                                                <p className="job-score-note">
                                                    {job.scoringMethod === "exact_skill_match"
                                                         ? t("job.allSkillsMatched")
                                                         : t("job.finalScore", { skill: skillScoreWeight, semantic: semanticScoreWeight })}
                                                </p>
                                            </div>
                                        )}

                                        <div className="job-match-stats">
                                             <div><strong>{job.matchedSkills?.length || 0}</strong><span>{t("job.matched")}</span></div>
                                             <div><strong>{job.relatedSkills?.length || 0}</strong><span>{t("job.related")}</span></div>
                                             <div><strong>{job.missingSkills?.length || 0}</strong><span>{t("job.missing")}</span></div>
                                        </div>

                                        {job.candidateSkills && job.candidateSkills.length > 0 && (
                                            <div className="job-match-evidence-block">
                                                <div className="job-match-subheading">
                                                    <span className="job-match-subheading-icon"><Sparkles size={14} aria-hidden="true" /></span>
                                                     <div><strong>{t("job.yourCvSkills")}</strong><span>{t("job.extractedSkills")}</span></div>
                                                </div>
                                                <div className="job-details-pill-list">
                                                    {job.candidateSkills.map((skill, index) => (
                                                        <span className="job-details-pill blue" key={`${skill}-${index}`}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {job.candidateLanguages && job.candidateLanguages.length > 0 && (
                                            <div className="job-match-evidence-block">
                                                <div className="job-match-subheading">
                                                    <span className="job-match-subheading-icon green"><Languages size={14} aria-hidden="true" /></span>
                                                     <div><strong>{t("job.languages")}</strong><span>{t("job.cvLanguages")}</span></div>
                                                </div>
                                                <div className="job-details-pill-list">
                                                    {job.candidateLanguages.map((language, index) => (
                                                        <span className="job-details-pill green" key={`${language}-${index}`}>{language}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {matchingRows.length > 0 && (
                                            <div className="job-match-table-wrap">
                                                <div className="job-match-subheading">
                                                    <span className="job-match-subheading-icon purple"><ArrowUpRight size={14} aria-hidden="true" /></span>
                                                     <div><strong>{t("job.breakdown")}</strong><span>{t("job.breakdownHelp")}</span></div>
                                                </div>
                                                <div className="job-match-table-scroll">
                                                    <table className="job-match-table">
                                                        <thead>
                                                            <tr><th>{t("job.skill")}</th><th>{t("job.priority")}</th><th>{t("recruiter.status")}</th><th>{t("job.evidence")}</th></tr>
                                                        </thead>
                                                        <tbody>
                                                            {matchingRows.map((row) => (
                                                                <tr key={row.name}>
                                                                    <td><strong>{row.name}</strong></td>
                                                                     <td><span className={`job-priority-badge ${importanceTone(row.importance)}`}>{localizedImportanceLabel(row.importance)}</span></td>
                                                                    <td>
                                                                         <span className={`job-match-status ${matchTypeTone(row.matchType)}`}><span />{localizedMatchTypeLabel(row.matchType)}</span>
                                                                        {row.matchType !== "missing" && row.score !== undefined && <small className="job-match-status-score">{Math.round(row.score * 100)}%</small>}
                                                                    </td>
                                                                     <td className="job-match-evidence-text">{row.evidence || t("job.noEvidence")}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                )}
                            </main>

                            <aside className="job-details-sidebar">
                                <section className="job-details-card">
                                    <div className="job-details-card-heading">
                                        <span className="job-details-section-icon amber"><BriefcaseBusiness size={17} aria-hidden="true" /></span>
                                         <div><span className="job-details-section-kicker">{t("job.quickOverview")}</span><h3>{t("job.atGlance")}</h3></div>
                                    </div>

                                    <div className="job-facts-list">
                                         <div className="job-fact"><span className="job-fact-icon"><MapPin size={16} aria-hidden="true" /></span><div><span>{t("jobs.location")}</span><strong>{job.location || t("common.notProvided")}</strong></div></div>
                                         <div className="job-fact"><span className="job-fact-icon"><WalletCards size={16} aria-hidden="true" /></span><div><span>{t("job.salaryRange")}</span><strong>{formatMoney(job.salaryMin)} – {formatMoney(job.salaryMax)}</strong></div></div>
                                         <div className="job-fact"><span className="job-fact-icon"><CalendarDays size={16} aria-hidden="true" /></span><div><span>{t("job.applicationDeadline")}</span><strong>{formatDate(job.applicationDeadline)}</strong></div></div>
                                         <div className="job-fact"><span className="job-fact-icon"><Clock3 size={16} aria-hidden="true" /></span><div><span>{t("job.experience")}</span><strong>{job.experienceLevel || t("common.notProvided")}</strong></div></div>
                                    </div>

                                     <div className="job-details-status-row"><span>{t("recruiter.status")}</span><span className="job-details-status">{job.status || "OPEN"}</span></div>

                                    {job.companyWebsite && (
                                        <a className="job-details-company-link" href={job.companyWebsite} target="_blank" rel="noopener noreferrer">
                                             {t("job.visitWebsite")} <ExternalLink size={15} aria-hidden="true" />
                                        </a>
                                    )}
                                </section>

                                <section className="job-apply-card">
                                    <div className="job-apply-card-top">
                                        <span className="job-apply-icon"><Send size={18} aria-hidden="true" /></span>
                                         <div><span className="job-details-section-kicker">{t("job.readyApply")}</span><h3>{t("job.makeMove")}</h3></div>
                                    </div>

                                    {hasApplied ? (
                                        <div className="job-apply-complete">
                                            <CheckCircle2 size={21} aria-hidden="true" />
                                             <div><strong>{t("job.allSet")}</strong><p>{t("job.withRecruiter")}</p></div>
                                        </div>
                                    ) : applicationsClosed ? (
                                        <div className="job-apply-complete">
                                            <AlertCircle size={21} aria-hidden="true" />
                                            <div><strong>{t("recruiter.closed")}</strong><p>{t("recruiter.jobClosedDescription")}</p></div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleApply}>
                                             <label className="job-apply-label" htmlFor="cover-letter">{t("job.coverLetter")}</label>
                                            <textarea
                                                id="cover-letter"
                                                className="job-apply-textarea"
                                                rows={7}
                                                 placeholder={t("job.coverLetterPlaceholder")}
                                                value={coverLetter}
                                                onChange={(event) => setCoverLetter(event.target.value)}
                                                required
                                            />
                                             <p className="job-apply-hint">{t("job.coverLetterHint")}</p>

                                            {error && <div className="job-details-form-alert error" role="alert"><AlertCircle size={16} aria-hidden="true" />{error}</div>}
                                            {success && <div className="job-details-form-alert success" role="status"><CheckCircle2 size={16} aria-hidden="true" />{success}</div>}

                                            <button type="submit" className="job-apply-button" disabled={loading || applicationsClosed}>
                                                <Send size={16} aria-hidden="true" />
                                                 {loading ? t("common.loading") : t("job.applyFor")}
                                            </button>
                                        </form>
                                    )}
                                </section>
                            </aside>
                        </div>
                    </div>

                    <footer className="job-details-footer">
                        <span><FileText size={14} aria-hidden="true" />{t("job.reviewCarefully")}</span>
                        <button type="button" className="job-details-footer-close" onClick={onClose}>{t("job.closeDetails")}</button>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
