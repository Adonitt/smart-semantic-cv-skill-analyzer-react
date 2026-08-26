import React from "react";
import {
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    Clock3,
    MapPin,
    Sparkles,
    WalletCards,
} from "lucide-react";

import type { Job } from "../types/job";
import { useLanguage } from "../i18n/LanguageContext";

interface JobCardProps {
    job: Job;
    onDetails: (job: Job) => void;
    hasApplied: boolean;
}

const formatLabel = (value?: string | null) => {
    if (!value) return "Not specified";

    return value
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const formatMoney = (value?: number | null) => {
    if (value === null || value === undefined) return "Not specified";

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    }).format(value);
};

const JobCard: React.FC<JobCardProps> = ({ job, onDetails, hasApplied }) => {
    const { t } = useLanguage();
    const skills = (job.matchedSkills?.length
        ? job.matchedSkills
        : (job.skills || "").split(/[,;\n]+/).map((skill) => skill.trim()).filter(Boolean)
    ).slice(0, 3);

    return (
        <article className="job-card">
            <div className="job-card-inner">
                <div className="job-card-topline">
                    <span className="job-card-company">
                        <Building2 size={14} aria-hidden="true" />
                        {job.companyName || t("job.company")}
                    </span>
                    {job.matchPercentage !== null && job.matchPercentage !== undefined && (
                        <span className="job-card-match">
                            <Sparkles size={13} aria-hidden="true" />
                            {job.matchPercentage.toFixed(0)}% {t("job.match")}
                        </span>
                    )}
                </div>

                <h3 className="job-card-title">{job.title}</h3>

                <div className="job-card-meta">
                    <span><MapPin size={14} aria-hidden="true" />{job.location || t("job.locationUnavailable")}</span>
                    <span><BriefcaseBusiness size={14} aria-hidden="true" />{formatLabel(job.employmentType)}</span>
                    <span><Clock3 size={14} aria-hidden="true" />{formatLabel(job.experienceLevel)}</span>
                </div>

                <p className="job-card-description">
                    {job.description?.length > 130
                        ? `${job.description.substring(0, 130)}…`
                        : job.description || t("job.noDescription")}
                </p>

                {skills.length > 0 && (
                    <div className="job-card-skills" aria-label={t("job.relevantSkills")}>
                        {skills.map((skill, index) => (
                            <span key={`${skill}-${index}`}>{skill}</span>
                        ))}
                        {(job.matchedSkills?.length || 0) > 3 && (
                            <span>+{job.matchedSkills!.length - 3}</span>
                        )}
                    </div>
                )}

                <div className="job-card-footer">
                    <div className="job-card-salary">
                        <WalletCards size={16} aria-hidden="true" />
                        <div>
                            <small>{t("job.salaryRange")}</small>
                            <strong>{formatMoney(job.salaryMin)} – {formatMoney(job.salaryMax)}</strong>
                        </div>
                    </div>

                    <div className="job-card-actions">
                        <button type="button" className="job-card-secondary" onClick={() => onDetails(job)}>
                            {t("job.details")}
                            <ArrowUpRight size={15} aria-hidden="true" />
                        </button>
                        {hasApplied ? (
                            <span className="job-card-applied">{t("job.applied")} <span aria-hidden="true">✓</span></span>
                        ) : (
                            <button type="button" className="job-card-primary" onClick={() => onDetails(job)}>
                                {t("job.apply")}
                                <ArrowUpRight size={15} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default JobCard;
