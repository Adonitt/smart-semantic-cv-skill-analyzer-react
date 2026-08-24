import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    CheckCircle2,
    Eye,
    FileText,
    Mail,
    Save,
    Sparkles,
    UploadCloud,
    UserRound,
} from "lucide-react";

import api from "../../services/api";

interface CandidateProfile {
    id: number;
    headline?: string | null;
    industryDomain?: string | null;
    cvFilePath?: string | null;
}

interface UserDetails {
    id: number;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
    candidateProfile?: CandidateProfile | null;
}

const CandidateProfilePage: React.FC = () => {
    const userId = localStorage.getItem("userId");
    const [user, setUser] = useState<UserDetails | null>(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [headline, setHeadline] = useState("");
    const [industryDomain, setIndustryDomain] = useState("");
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewingCv, setViewingCv] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadProfile = useCallback(async () => {
        if (!userId) {
            setError("User ID not found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get<UserDetails>(`/users/${userId}`);
            setUser(response.data);
            setFullName(response.data.fullName || "");
            setEmail(response.data.email || "");
            setHeadline(response.data.candidateProfile?.headline || "");
            setIndustryDomain(response.data.candidateProfile?.industryDomain || "");
        } catch (requestError: unknown) {
            console.error(requestError);
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message || "Failed to load profile."
                    : "Failed to load profile."
            );
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    const profileCompletion = useMemo(() => {
        if (!user) return 0;

        return Math.round(
            ([fullName, email, headline, industryDomain, user.candidateProfile?.cvFilePath]
                .filter(Boolean).length /
                5) *
                100
        );
    }, [email, fullName, headline, industryDomain, user]);

    const initials = (user?.fullName || "Candidate")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

    const joinedDate = user?.createdAt
        ? new Intl.DateTimeFormat("en", {
              month: "short",
              year: "numeric",
          }).format(new Date(user.createdAt))
        : "—";

    const handleSaveProfile = async (event: React.FormEvent) => {
        event.preventDefault();

        const nextFullName = fullName.trim();
        const nextEmail = email.trim().toLowerCase();

        if (!nextFullName || !nextEmail) {
            setError("Name and email are required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await api.put("/candidate/profile", {
                fullName: nextFullName,
                email: nextEmail,
                headline: headline.trim(),
                industryDomain: industryDomain.trim(),
            });

            localStorage.setItem("fullName", nextFullName);
            localStorage.setItem("email", nextEmail);
            window.dispatchEvent(new Event("profile-updated"));
            setUser((currentUser) => currentUser
                ? { ...currentUser, fullName: nextFullName, email: nextEmail }
                : currentUser
            );
            setFullName(nextFullName);
            setEmail(nextEmail);
            setSuccess("Your profile details have been updated.");
        } catch (requestError: unknown) {
            console.error(requestError);
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message || "Failed to update profile."
                    : "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            setError("Only PDF files are allowed.");
            setCvFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Please choose a PDF smaller than 5 MB.");
            setCvFile(null);
            return;
        }

        setError("");
        setSuccess("");
        setCvFile(file);
    };

    const handleUploadCv = async () => {
        if (!cvFile) {
            setError("Choose a PDF CV before uploading.");
            return;
        }

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            const formData = new FormData();
            formData.append("file", cvFile);

            await api.post("/cv/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccess(user?.candidateProfile?.cvFilePath ? "CV changed successfully." : "CV uploaded successfully.");
            setCvFile(null);

            const fileInput = document.getElementById("cvInput") as HTMLInputElement | null;
            if (fileInput) fileInput.value = "";

            await loadProfile();
        } catch (requestError: unknown) {
            console.error(requestError);
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message || "Failed to upload CV."
                    : "Failed to upload CV."
            );
        } finally {
            setUploading(false);
        }
    };

    const handleViewCv = async () => {
        const cvWindow = window.open("about:blank", "_blank");

        try {
            setViewingCv(true);
            setError("");

            const response = await api.get("/cv/me", { responseType: "blob" });
            const fileUrl = window.URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );

            if (cvWindow) {
                cvWindow.location.href = fileUrl;
            } else {
                window.open(fileUrl, "_blank", "noopener,noreferrer");
            }

            window.setTimeout(() => window.URL.revokeObjectURL(fileUrl), 10000);
        } catch (requestError: unknown) {
            console.error(requestError);
            cvWindow?.close();
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message || "Failed to open CV."
                    : "Failed to open CV."
            );
        } finally {
            setViewingCv(false);
        }
    };

    if (loading) {
        return (
            <main className="profile-page">
                <div className="profile-loading">
                    <span className="dashboard-spinner" aria-hidden="true" />
                    <p>Loading your profile…</p>
                </div>
            </main>
        );
    }

    return (
        <main className="profile-page">
            <div className="container profile-container">
                <header className="profile-page-heading">
                    <div>
                        <span className="profile-eyebrow">Candidate workspace</span>
                        <h1>My profile</h1>
                        <p>Keep your professional story complete and ready for the next opportunity.</p>
                    </div>
                    <Link to="/candidate/jobs" className="profile-back-link">
                        Find jobs
                        <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </header>

                {error && <div className="profile-alert profile-alert-error" role="alert">{error}</div>}
                {success && <div className="profile-alert profile-alert-success" role="status"><CheckCircle2 size={17} aria-hidden="true" />{success}</div>}

                <section className="profile-hero">
                    <div className="profile-avatar-large">{initials || "C"}</div>
                    <div className="profile-hero-copy">
                        <span className="profile-hero-kicker"><Sparkles size={14} aria-hidden="true" /> Profile overview</span>
                        <h2>{user?.fullName || "Candidate"}</h2>
                        <p>{headline || "Add a professional headline to tell recruiters what you do."}</p>
                        <div className="profile-hero-meta">
                            <span><Mail size={14} aria-hidden="true" />{user?.email || "Email not available"}</span>
                            <span><BriefcaseBusiness size={14} aria-hidden="true" />Candidate</span>
                            <span><CalendarDays size={14} aria-hidden="true" />Joined {joinedDate}</span>
                        </div>
                    </div>
                    <div className="profile-completion">
                        <div className="profile-completion-ring" style={{ "--profile-progress": `${profileCompletion * 3.6}deg` } as React.CSSProperties}>
                            <strong>{profileCompletion}%</strong>
                            <span>complete</span>
                        </div>
                        <div className="profile-completion-copy">
                            <strong>Profile strength</strong>
                            <p>{profileCompletion >= 80 ? "You are ready to be discovered." : "Complete a few more details to stand out."}</p>
                        </div>
                    </div>
                </section>

                <div className="profile-layout">
                    <section className="profile-card">
                        <div className="profile-card-header">
                            <span className="profile-section-icon blue"><UserRound size={18} aria-hidden="true" /></span>
                            <div><span>Professional identity</span><h2>Personal information</h2></div>
                        </div>

                        <form className="profile-form" onSubmit={handleSaveProfile}>
                            <div className="profile-form-grid">
                                <div className="profile-field">
                                    <label htmlFor="profile-fullName">Full name</label>
                                    <input id="profile-fullName" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" maxLength={120} required />
                                    <small>Shown to recruiters on your applications.</small>
                                </div>
                                <div className="profile-field">
                                    <label htmlFor="profile-email">Email address</label>
                                    <input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={160} required />
                                    <small>Used for sign-in and account messages.</small>
                                </div>
                                <div className="profile-field profile-field-full">
                                    <label htmlFor="profile-headline">Professional headline</label>
                                    <input id="profile-headline" type="text" value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="e.g. Java backend developer" maxLength={120} />
                                    <small>A clear headline helps recruiters understand your direction.</small>
                                </div>
                                <div className="profile-field profile-field-full">
                                    <label htmlFor="profile-industry">Industry domain</label>
                                    <input id="profile-industry" type="text" value={industryDomain} onChange={(event) => setIndustryDomain(event.target.value)} placeholder="e.g. Software development" maxLength={100} />
                                </div>
                            </div>

                            <div className="profile-form-footer">
                                <span><Check size={14} aria-hidden="true" /> Changes are saved to your candidate profile.</span>
                                <button type="submit" className="profile-primary-button" disabled={saving}>
                                    <Save size={16} aria-hidden="true" />
                                    {saving ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="profile-card profile-cv-card">
                        <div className="profile-card-header">
                            <span className="profile-section-icon violet"><FileText size={18} aria-hidden="true" /></span>
                            <div><span>Recruiter-ready document</span><h2>My CV</h2></div>
                        </div>

                        {user?.candidateProfile?.cvFilePath ? (
                            <div className="profile-cv-status uploaded">
                                <span><CheckCircle2 size={19} aria-hidden="true" /></span>
                                <div><strong>CV uploaded</strong><p>Your CV is available for matching and recruiter review.</p></div>
                            </div>
                        ) : (
                            <div className="profile-cv-status missing">
                                <span><FileText size={19} aria-hidden="true" /></span>
                                <div><strong>No CV uploaded yet</strong><p>Upload a PDF so SmartHire can identify relevant skills.</p></div>
                            </div>
                        )}

                        {user?.candidateProfile?.cvFilePath && (
                            <button type="button" className="profile-secondary-button profile-view-cv" onClick={handleViewCv} disabled={viewingCv}>
                                <Eye size={16} aria-hidden="true" />
                                {viewingCv ? "Opening…" : "View current CV"}
                            </button>
                        )}

                        <div className="profile-upload-divider"><span>or update your document</span></div>

                        <label className="profile-upload-zone" htmlFor="cvInput">
                            <span className="profile-upload-icon"><UploadCloud size={21} aria-hidden="true" /></span>
                            <span className="profile-upload-copy">
                                <strong>{cvFile ? cvFile.name : "Choose a PDF CV"}</strong>
                                <small>{cvFile ? "Ready to upload" : "Maximum 5 MB · PDF only"}</small>
                            </span>
                            <span className="profile-file-chooser">
                                <UploadCloud size={15} aria-hidden="true" />
                                {cvFile ? "Change file" : "Choose file"}
                            </span>
                            <input className="profile-file-input" id="cvInput" type="file" accept=".pdf,application/pdf" onChange={handleFileChange} />
                        </label>

                        <button type="button" className="profile-primary-button profile-upload-button" onClick={handleUploadCv} disabled={uploading || !cvFile}>
                            <UploadCloud size={16} aria-hidden="true" />
                            {uploading ? "Uploading…" : user?.candidateProfile?.cvFilePath ? "Change CV" : "Upload CV"}
                        </button>

                        <p className="profile-cv-note">Your CV is used to surface relevant skill evidence. Review the result before applying.</p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default CandidateProfilePage;
