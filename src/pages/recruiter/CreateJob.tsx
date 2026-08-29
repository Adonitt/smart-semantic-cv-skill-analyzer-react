import React, { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Plus, Save, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { createJob, getMyJobById, updateJob } from "../../services/jobService";
import type {
    EmploymentType,
    ExperienceLevel,
    JobSkill,
    JobFormState,
    JobStatus,
    SkillImportance,
} from "../../types/job";
import {
    DashboardShell,
    ErrorState,
    SectionCard,
    StatusBadge,
} from "../../components/dashboard/DashboardPrimitives";
import { useLanguage } from "../../i18n/LanguageContext";

const normalizeImportance = (importance?: string): SkillImportance => {
    if (importance === "MUST_HAVE" || importance === "NICE_TO_HAVE") {
        return importance;
    }

    return "IMPORTANT";
};

const normalizeJobStatus = (status?: string): JobStatus => {
    if (status === "PUBLISHED" || status === "CLOSED") {
        return status;
    }

    return "DRAFT";
};

const getEditableSkills = (skills?: JobSkill[], legacySkills?: string): JobSkill[] => {
    if (skills?.length) {
        return skills.map((skill, index) => ({
            name: skill.name,
            importance: normalizeImportance(skill.importance),
            displayOrder: skill.displayOrder ?? index,
        }));
    }

    return (legacySkills || "")
        .split(/[,;\n]+/)
        .map((name, index) => ({
            name: name.trim(),
            importance: "IMPORTANT" as SkillImportance,
            displayOrder: index,
        }))
        .filter((skill) => skill.name);
};

const CreateJob: React.FC = () => {
    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();
    const editingJobId = jobId ? Number(jobId) : null;
    const isEditing = editingJobId !== null && Number.isFinite(editingJobId);
    const { t } = useLanguage();
    const [form, setForm] = useState<JobFormState>({
        title: "",
        description: "",
        requirements: "",
        skills: "",
        skillRequirements: [],
        location: "",
        employmentType: "FULL_TIME",
        experienceLevel: "ENTRY_LEVEL",
        salaryMin: 0,
        salaryMax: 0,
        applicationDeadline: "",
        status: "DRAFT",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [skillName, setSkillName] = useState("");
    const [skillImportance, setSkillImportance] = useState<SkillImportance>("IMPORTANT");

    useEffect(() => {
        if (!isEditing || editingJobId === null) {
            return;
        }

        const loadJob = async () => {
            try {
                setInitialLoading(true);
                const job = await getMyJobById(editingJobId);
                setForm({
                    title: job.title || "",
                    description: job.description || "",
                    requirements: job.requirements || "",
                    skills: job.skills || "",
                    skillRequirements: getEditableSkills(job.skillRequirements, job.skills),
                    location: job.location || "",
                    employmentType: job.employmentType as EmploymentType,
                    experienceLevel: job.experienceLevel as ExperienceLevel,
                    salaryMin: job.salaryMin || 0,
                    salaryMax: job.salaryMax || 0,
                    applicationDeadline: job.applicationDeadline || "",
                    status: normalizeJobStatus(job.status),
                });
            } catch (loadError) {
                console.error("Failed to load job for editing:", loadError);
                setError(t("recruiter.jobsUnavailable"));
            } finally {
                setInitialLoading(false);
            }
        };

        void loadJob();
    }, [editingJobId, isEditing, t]);

    const updateField = <K extends keyof JobFormState>(
        field: K,
        value: JobFormState[K]
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleDeadlineChange = (deadline: string) => {
        const today = new Date();
        const todayIso = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
        ].join("-");

        setForm((current) => ({
            ...current,
            applicationDeadline: deadline,
            ...(isEditing && Boolean(deadline) && deadline < todayIso
                ? { status: "CLOSED" as JobStatus }
                : {}),
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (form.salaryMax < form.salaryMin) {
            setError(t("recruiter.maximumSalary"));
            return;
        }

        if (!form.skillRequirements.length) {
            setError(t("recruiter.addSkillHelp"));
            return;
        }

        const uniqueSkillNames = new Set(
            form.skillRequirements.map((skill) => skill.name.trim().toLocaleLowerCase())
        );
        if (uniqueSkillNames.size !== form.skillRequirements.length) {
            setError(t("recruiter.addSkillHelp"));
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...form,
                skills: form.skillRequirements.map((skill) => skill.name).join(", "),
                skillRequirements: form.skillRequirements.map((skill, index) => ({
                    ...skill,
                    displayOrder: index,
                })),
            };

            let savedJob;
            if (isEditing && editingJobId !== null) {
                savedJob = await updateJob(editingJobId, payload);
            } else {
                const { status: _status, ...createPayload } = payload;
                savedJob = await createJob(createPayload);
            }

            navigate(`/recruiter/jobs/${savedJob.id}`);
        } catch (submitError) {
            console.error("Failed to save job:", submitError);
            setError(t("common.tryAgain"));
        } finally {
            setLoading(false);
        }
    };

    const addSkill = () => {
        const name = skillName.trim();
        if (!name) {
            return;
        }

        const alreadyAdded = form.skillRequirements.some(
            (skill) => skill.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase()
        );
        if (alreadyAdded) {
            setError(t("recruiter.addSkillHelp"));
            return;
        }

        const newSkill: JobSkill = {
            name,
            importance: skillImportance,
            displayOrder: form.skillRequirements.length,
        };
        setForm((current) => ({
            ...current,
            skillRequirements: [...current.skillRequirements, newSkill],
        }));
        setSkillName("");
        setError("");
    };

    const removeSkill = (indexToRemove: number) => {
        setForm((current) => ({
            ...current,
            skillRequirements: current.skillRequirements
                .filter((_, index) => index !== indexToRemove)
                .map((skill, index) => ({ ...skill, displayOrder: index })),
        }));
    };

    const updateSkillImportance = (indexToUpdate: number, importance: SkillImportance) => {
        setForm((current) => ({
            ...current,
            skillRequirements: current.skillRequirements.map((skill, index) =>
                index === indexToUpdate ? { ...skill, importance } : skill
            ),
        }));
    };

    const updateSkillName = (indexToUpdate: number, name: string) => {
        setForm((current) => ({
            ...current,
            skillRequirements: current.skillRequirements.map((skill, index) =>
                index === indexToUpdate ? { ...skill, name } : skill
            ),
        }));
    };

    return (
        <DashboardShell
            eyebrow={t("recruiter.workspace")}
            title={isEditing ? t("recruiter.editJob") : t("recruiter.newJob")}
            description={isEditing
                ? t("recruiter.jobOpeningsDescription")
                : t("recruiter.roleContentDescription")}
            actions={
                <Link to="/recruiter/jobs" className="btn btn-outline-secondary">
                    <ArrowLeft size={17} aria-hidden="true" />
                    {t("recruiter.myJobs")}
                </Link>
            }
        >
            {error && <ErrorState message={error} />}

            {initialLoading && <div className="dashboard-state">{t("admin.loadingDetails")}</div>}

            {!initialLoading && <SectionCard
                className="recruiter-job-editor-card"
                 title={isEditing ? t("recruiter.updateJob") : t("recruiter.newJob")}
                description={isEditing
                     ? t("common.saveChanges")
                     : t("recruiter.basicInformationDescription")}
            >
                <div className="recruiter-editor-intro">
                    <span className="recruiter-editor-icon" aria-hidden="true">
                        <BriefcaseBusiness size={21} />
                    </span>
                    <div className="recruiter-editor-intro-copy">
                         <span>{isEditing ? t("recruiter.editJob") : t("recruiter.newJob")}</span>
                        <p>{isEditing
                             ? t("common.saveChanges")
                             : t("recruiter.roleContentDescription")}</p>
                    </div>
                    {isEditing ? (
                        <StatusBadge status={form.status} />
                    ) : (
                         <span className="recruiter-editor-draft-note">{t("recruiter.draftNote")}</span>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="recruiter-job-form">
                    <div className="recruiter-job-form-grid">
                        <div className="recruiter-form-section-heading recruiter-job-field-full">
                            <span className="recruiter-form-section-number">01</span>
                            <div>
                            <h3>{t("recruiter.basicInformation")}</h3>
                            <p>{t("recruiter.basicInformationDescription")}</p>
                            </div>
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-title">
                            <label className="form-label" htmlFor="job-title">{t("recruiter.jobTitle")} *</label>
                            <input
                                id="job-title"
                                className="form-control"
                                value={form.title}
                                onChange={(event) => updateField("title", event.target.value)}
                                required
                            />
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-location">
                            <label className="form-label" htmlFor="job-location">{t("jobs.location")} *</label>
                            <input
                                id="job-location"
                                className="form-control"
                                value={form.location}
                                onChange={(event) => updateField("location", event.target.value)}
                                required
                            />
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-small">
                            <label className="form-label" htmlFor="employment-type">{t("recruiter.employmentType")} *</label>
                            <select
                                id="employment-type"
                                className="form-select"
                                value={form.employmentType}
                                onChange={(event) => updateField("employmentType", event.target.value as EmploymentType)}
                            >
                                <option value="FULL_TIME">{t("jobs.fullTime")}</option>
                                <option value="PART_TIME">{t("jobs.partTime")}</option>
                                <option value="CONTRACT">{t("jobs.contract")}</option>
                                <option value="INTERNSHIP">{t("jobs.internship")}</option>
                            </select>
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-small">
                            <label className="form-label" htmlFor="experience-level">{t("recruiter.experienceLevel")} *</label>
                            <select
                                id="experience-level"
                                className="form-select"
                                value={form.experienceLevel}
                                onChange={(event) => updateField("experienceLevel", event.target.value as ExperienceLevel)}
                            >
                                <option value="ENTRY_LEVEL">{t("jobs.entryLevel")}</option>
                                <option value="MID_LEVEL">{t("jobs.midLevel")}</option>
                                <option value="SENIOR_LEVEL">{t("jobs.seniorLevel")}</option>
                            </select>
                        </div>
                        <div className="recruiter-form-section-heading recruiter-job-field-full">
                            <span className="recruiter-form-section-number">02</span>
                            <div>
                            <h3>{t("recruiter.compensationTimeline")}</h3>
                            <p>{t("recruiter.compensationDescription")}</p>
                            </div>
                        </div>
                        <div className="recruiter-job-field">
                            <label className="form-label" htmlFor="salary-min">{t("recruiter.minimumSalary")} *</label>
                            <input
                                id="salary-min"
                                type="number"
                                min="0"
                                className="form-control"
                                value={form.salaryMin}
                                onChange={(event) => updateField("salaryMin", Number(event.target.value))}
                                required
                            />
                        </div>
                        <div className="recruiter-job-field">
                            <label className="form-label" htmlFor="salary-max">{t("recruiter.maximumSalary")} *</label>
                            <input
                                id="salary-max"
                                type="number"
                                min="0"
                                className="form-control"
                                value={form.salaryMax}
                                onChange={(event) => updateField("salaryMax", Number(event.target.value))}
                                required
                            />
                        </div>
                        <div className="recruiter-job-field">
                            <label className="form-label" htmlFor="application-deadline">{t("recruiter.applicationDeadline")} *</label>
                            <input
                                id="application-deadline"
                                type="date"
                                className="form-control"
                                value={form.applicationDeadline}
                                onChange={(event) => handleDeadlineChange(event.target.value)}
                                required
                            />
                        </div>
                        {isEditing && (
                            <div className="recruiter-job-field">
                                <label className="form-label" htmlFor="job-status">{t("recruiter.jobStatus")} *</label>
                                <select
                                    id="job-status"
                                    className="form-select"
                                    value={form.status}
                                    onChange={(event) => updateField("status", event.target.value as JobStatus)}
                                >
                                    <option value="DRAFT">{t("recruiter.draft")}</option>
                                    <option value="PUBLISHED">{t("recruiter.published")}</option>
                                    <option value="CLOSED">{t("recruiter.closed")}</option>
                                </select>
                                <small className="recruiter-field-help">{t("recruiter.publishedVisible")}</small>
                            </div>
                        )}
                        <div className="recruiter-form-section-heading recruiter-job-field-full">
                            <span className="recruiter-form-section-number">03</span>
                            <div>
                            <h3>{t("recruiter.roleContent")}</h3>
                            <p>{t("recruiter.roleContentDescription")}</p>
                            </div>
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-content-wide">
                            <label className="form-label" htmlFor="job-description">{t("recruiter.description")} *</label>
                            <textarea
                                id="job-description"
                                className="form-control"
                                rows={3}
                                value={form.description}
                                onChange={(event) => updateField("description", event.target.value)}
                                required
                            />
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-content">
                            <label className="form-label" htmlFor="job-requirements">{t("recruiter.requirements")} *</label>
                            <textarea
                                id="job-requirements"
                                className="form-control"
                                rows={3}
                                placeholder="One requirement per line"
                                value={form.requirements}
                                onChange={(event) => updateField("requirements", event.target.value)}
                                required
                            />
                        </div>
                        <div className="recruiter-form-section-heading recruiter-job-field-full">
                            <span className="recruiter-form-section-number">04</span>
                            <div>
                            <h3>{t("recruiter.skillsImportance")}</h3>
                            <p>{t("recruiter.skillsImportanceDescription")}</p>
                            </div>
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-full recruiter-skill-editor">
                            <label className="form-label" htmlFor="job-skill-name">{t("recruiter.skillsLabel")} *</label>
                            <div className="recruiter-skill-add-row">
                                <div className="recruiter-skill-add-name">
                                    <input
                                        id="job-skill-name"
                                        className="form-control"
                                        placeholder="For example: Customer Service, Excel, Java"
                                        value={skillName}
                                        onChange={(event) => setSkillName(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                addSkill();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="recruiter-skill-add-importance">
                                    <select
                                        className="form-select"
                                        value={skillImportance}
                                        onChange={(event) => setSkillImportance(event.target.value as SkillImportance)}
                                    >
                                        <option value="MUST_HAVE">{t("recruiter.mustHave")}</option>
                                        <option value="IMPORTANT">{t("recruiter.important")}</option>
                                        <option value="NICE_TO_HAVE">{t("recruiter.niceToHave")}</option>
                                    </select>
                                </div>
                                <div className="recruiter-skill-add-action">
                                    <button type="button" className="btn btn-outline-primary" onClick={addSkill}>
                                        <Plus size={16} aria-hidden="true" /> {t("recruiter.add")}
                                    </button>
                                </div>
                            </div>
                            <p className="form-text">{t("recruiter.addSkillHelp")}</p>
                            {form.skillRequirements.length > 0 && (
                                <div className="recruiter-skill-list">
                                    {form.skillRequirements.map((skill, index) => (
                                        <div key={`${skill.name}-${index}`} className="recruiter-skill-row">
                                            <input
                                                className="recruiter-skill-name"
                                                value={skill.name}
                                                aria-label={`Skill ${index + 1} name`}
                                                onChange={(event) => updateSkillName(index, event.target.value)}
                                                required
                                            />
                                            <select
                                                className="form-select recruiter-skill-importance"
                                                value={skill.importance}
                                                aria-label={`Importance for ${skill.name}`}
                                                onChange={(event) => updateSkillImportance(index, event.target.value as SkillImportance)}
                                            >
                                                 <option value="MUST_HAVE">{t("recruiter.mustHave")}</option>
                                                 <option value="IMPORTANT">{t("recruiter.important")}</option>
                                                 <option value="NICE_TO_HAVE">{t("recruiter.niceToHave")}</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                aria-label={`Remove ${skill.name}`}
                                                onClick={() => removeSkill(index)}
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="recruiter-job-form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Save size={17} aria-hidden="true" />
                            {loading ? t("security.saving") : isEditing ? t("recruiter.updateJob") : t("recruiter.saveDraft")}
                        </button>
                        <Link to="/recruiter/jobs" className="btn btn-light">
                            {t("common.cancel")}
                        </Link>
                    </div>
                </form>
            </SectionCard>}
        </DashboardShell>
    );
};

export default CreateJob;
