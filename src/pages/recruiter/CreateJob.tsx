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
                setError("The job could not be loaded. It may no longer exist.");
            } finally {
                setInitialLoading(false);
            }
        };

        void loadJob();
    }, [editingJobId, isEditing]);

    const updateField = <K extends keyof JobFormState>(
        field: K,
        value: JobFormState[K]
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (form.salaryMax < form.salaryMin) {
            setError("Maximum salary must be greater than or equal to minimum salary.");
            return;
        }

        if (!form.skillRequirements.length) {
            setError("Add at least one skill and choose its importance.");
            return;
        }

        const uniqueSkillNames = new Set(
            form.skillRequirements.map((skill) => skill.name.trim().toLocaleLowerCase())
        );
        if (uniqueSkillNames.size !== form.skillRequirements.length) {
            setError("Each skill can only be added once.");
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
            setError("The job could not be saved. Check the fields and try again.");
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
            setError("This skill has already been added.");
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
            eyebrow="Recruiter workspace"
            title={isEditing ? "Edit job" : "Create a job"}
            description={isEditing
                ? "Keep the role details and requirements up to date."
                : "Add the information candidates need to understand the role and its requirements."}
            actions={
                <Link to="/recruiter/jobs" className="btn btn-outline-secondary">
                    <ArrowLeft size={17} aria-hidden="true" />
                    Back to jobs
                </Link>
            }
        >
            {error && <ErrorState message={error} />}

            {initialLoading && <div className="dashboard-state">Loading job details…</div>}

            {!initialLoading && <SectionCard
                className="recruiter-job-editor-card"
                title={isEditing ? "Update job" : "Create job"}
                description={isEditing
                    ? "Review the opening and save the latest changes."
                    : "Create a clear opening that candidates can understand at a glance."}
            >
                <div className="recruiter-editor-intro">
                    <span className="recruiter-editor-icon" aria-hidden="true">
                        <BriefcaseBusiness size={21} />
                    </span>
                    <div className="recruiter-editor-intro-copy">
                        <span>{isEditing ? "Editing an existing opening" : "A strong opening starts here"}</span>
                        <p>{isEditing
                            ? "Make the changes you need, then save to update this job."
                            : "Add the role details, expectations and skills candidates need."}</p>
                    </div>
                    {isEditing ? (
                        <StatusBadge status={form.status} />
                    ) : (
                        <span className="recruiter-editor-draft-note">Starts as draft</span>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="recruiter-job-form">
                    <div className="recruiter-job-form-grid">
                        <div className="recruiter-form-section-heading recruiter-job-field-full">
                            <span className="recruiter-form-section-number">01</span>
                            <div>
                            <h3>Basic information</h3>
                            <p>Define the role, location and working arrangement.</p>
                            </div>
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-title">
                            <label className="form-label" htmlFor="job-title">Job title *</label>
                            <input
                                id="job-title"
                                className="form-control"
                                value={form.title}
                                onChange={(event) => updateField("title", event.target.value)}
                                required
                            />
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-location">
                            <label className="form-label" htmlFor="job-location">Location *</label>
                            <input
                                id="job-location"
                                className="form-control"
                                value={form.location}
                                onChange={(event) => updateField("location", event.target.value)}
                                required
                            />
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-small">
                            <label className="form-label" htmlFor="employment-type">Employment type *</label>
                            <select
                                id="employment-type"
                                className="form-select"
                                value={form.employmentType}
                                onChange={(event) => updateField("employmentType", event.target.value as EmploymentType)}
                            >
                                <option value="FULL_TIME">Full time</option>
                                <option value="PART_TIME">Part time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-small">
                            <label className="form-label" htmlFor="experience-level">Experience level *</label>
                            <select
                                id="experience-level"
                                className="form-select"
                                value={form.experienceLevel}
                                onChange={(event) => updateField("experienceLevel", event.target.value as ExperienceLevel)}
                            >
                                <option value="ENTRY_LEVEL">Entry level</option>
                                <option value="MID_LEVEL">Mid level</option>
                                <option value="SENIOR_LEVEL">Senior level</option>
                            </select>
                        </div>
                        <div className="recruiter-form-section-heading recruiter-job-field-full">
                            <span className="recruiter-form-section-number">02</span>
                            <div>
                            <h3>Compensation &amp; timeline</h3>
                            <p>Set the salary range, application deadline and publication status.</p>
                            </div>
                        </div>
                        <div className="recruiter-job-field">
                            <label className="form-label" htmlFor="salary-min">Minimum salary *</label>
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
                            <label className="form-label" htmlFor="salary-max">Maximum salary *</label>
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
                            <label className="form-label" htmlFor="application-deadline">Application deadline *</label>
                            <input
                                id="application-deadline"
                                type="date"
                                className="form-control"
                                value={form.applicationDeadline}
                                onChange={(event) => updateField("applicationDeadline", event.target.value)}
                                required
                            />
                        </div>
                        {isEditing && (
                            <div className="recruiter-job-field">
                                <label className="form-label" htmlFor="job-status">Job status *</label>
                                <select
                                    id="job-status"
                                    className="form-select"
                                    value={form.status}
                                    onChange={(event) => updateField("status", event.target.value as JobStatus)}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <small className="recruiter-field-help">Published jobs are visible to candidates.</small>
                            </div>
                        )}
                        <div className="recruiter-form-section-heading recruiter-job-field-full">
                            <span className="recruiter-form-section-number">03</span>
                            <div>
                            <h3>Role content</h3>
                            <p>Give candidates the context and expectations they need before applying.</p>
                            </div>
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-content-wide">
                            <label className="form-label" htmlFor="job-description">Description *</label>
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
                            <label className="form-label" htmlFor="job-requirements">Requirements *</label>
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
                            <h3>Skills &amp; importance</h3>
                            <p>Prioritise skills so the matching service can weigh them correctly.</p>
                            </div>
                        </div>
                        <div className="recruiter-job-field recruiter-job-field-full recruiter-skill-editor">
                            <label className="form-label" htmlFor="job-skill-name">Skills and importance *</label>
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
                                        <option value="MUST_HAVE">Must-have</option>
                                        <option value="IMPORTANT">Important</option>
                                        <option value="NICE_TO_HAVE">Nice-to-have</option>
                                    </select>
                                </div>
                                <div className="recruiter-skill-add-action">
                                    <button type="button" className="btn btn-outline-primary" onClick={addSkill}>
                                        <Plus size={16} aria-hidden="true" /> Add
                                    </button>
                                </div>
                            </div>
                            <p className="form-text">Add each skill separately so the matching score can respect its importance.</p>
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
                                                <option value="MUST_HAVE">Must-have</option>
                                                <option value="IMPORTANT">Important</option>
                                                <option value="NICE_TO_HAVE">Nice-to-have</option>
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
                            {loading ? "Saving…" : "Save job"}
                        </button>
                        <Link to="/recruiter/jobs" className="btn btn-light">
                            Cancel
                        </Link>
                    </div>
                </form>
            </SectionCard>}
        </DashboardShell>
    );
};

export default CreateJob;
