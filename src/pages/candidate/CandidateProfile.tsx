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
import { resendVerification } from "../../services/authService";
import { useLanguage } from "../../i18n/LanguageContext";

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
    emailVerified: boolean;
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
    const [sendingVerification, setSendingVerification] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { language, t } = useLanguage();

    const loadProfile = useCallback(async () => {
        if (!userId) {
            setError(t("candidate.profileUnavailable"));
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
                    ? requestError.response?.data?.message || t("candidate.profileUnavailable")
                    : t("candidate.profileUnavailable")
            );
        } finally {
            setLoading(false);
        }
    }, [t, userId]);

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
        ? new Intl.DateTimeFormat(language, {
              month: "short",
              year: "numeric",
          }).format(new Date(user.createdAt))
        : "—";

    const handleSaveProfile = async (event: React.FormEvent) => {
        event.preventDefault();

        const nextFullName = fullName.trim();
        const nextEmail = email.trim().toLowerCase();

        if (!nextFullName || !nextEmail) {
            setError(t("admin.fullNameEmailRequired"));
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
                ? {
                    ...currentUser,
                    fullName: nextFullName,
                    email: nextEmail,
                    emailVerified: currentUser.email.toLowerCase() === nextEmail
                        ? currentUser.emailVerified
                        : false,
                }
                : currentUser
            );
            setFullName(nextFullName);
            setEmail(nextEmail);
            setSuccess(t("candidate.savedProfile"));
        } catch (requestError: unknown) {
            console.error(requestError);
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message || t("admin.profileUpdateError")
                    : t("admin.profileUpdateError")
            );
        } finally {
            setSaving(false);
        }
    };

    const handleResendVerification = async () => {
        if (!user?.email || sendingVerification) return;

        try {
            setSendingVerification(true);
            setError("");
            setSuccess("");
            const message = await resendVerification(user.email);
            setSuccess(message || t("auth.verificationSent"));
        } catch (requestError: unknown) {
            console.error(requestError);
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message || t("auth.verificationError")
                    : t("auth.verificationError")
            );
        } finally {
            setSendingVerification(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            setError(t("candidate.onlyPdf"));
            setCvFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(t("candidate.pdfTooLarge"));
            setCvFile(null);
            return;
        }

        setError("");
        setSuccess("");
        setCvFile(file);
    };

    const handleUploadCv = async () => {
        if (!cvFile) {
            setError(t("candidate.choosePdfFirst"));
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

            setSuccess(user?.candidateProfile?.cvFilePath ? t("candidate.cvChanged") : t("candidate.cvUploadedSuccess"));
            setCvFile(null);

            const fileInput = document.getElementById("cvInput") as HTMLInputElement | null;
            if (fileInput) fileInput.value = "";

            await loadProfile();
        } catch (requestError: unknown) {
            console.error(requestError);
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message || t("candidate.uploadCv")
                    : t("candidate.uploadCv")
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
                    ? requestError.response?.data?.message || t("candidate.viewCurrentCv")
                    : t("candidate.viewCurrentCv")
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
                    <p>{t("common.loading")}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="profile-page">
            <div className="container profile-container">
                <header className="profile-page-heading">
                    <div>
                        <span className="profile-eyebrow">{t("candidate.workspace")}</span>
                        <h1>{t("candidate.profileTitle")}</h1>
                        <p>{t("candidate.profileDescription")}</p>
                    </div>
                    <Link to="/candidate/jobs" className="profile-back-link">
                        {t("candidate.findJobs")}
                        <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </header>

                {error && <div className="profile-alert profile-alert-error" role="alert">{error}</div>}
                {success && <div className="profile-alert profile-alert-success" role="status"><CheckCircle2 size={17} aria-hidden="true" />{success}</div>}

                <section className="profile-hero">
                    <div className="profile-avatar-large">{initials || "C"}</div>
                    <div className="profile-hero-copy">
                        <span className="profile-hero-kicker"><Sparkles size={14} aria-hidden="true" /> {t("candidate.profileOverview")}</span>
                        <h2>{user?.fullName || t("common.candidate")}</h2>
                        <p>{headline || t("candidate.addHeadline")}</p>
                        <div className="profile-hero-meta">
                        <span><Mail size={14} aria-hidden="true" />{user?.email || t("admin.emailUnavailable")}</span>
                            <span className={user?.emailVerified ? "profile-email-status verified" : "profile-email-status"}>
                                <CheckCircle2 size={14} aria-hidden="true" />
                                {user?.emailVerified ? t("candidate.emailVerified") : t("candidate.emailNotVerified")}
                            </span>
                            {!user?.emailVerified && (
                                <button
                                    type="button"
                                    className="profile-email-action"
                                    onClick={() => void handleResendVerification()}
                                    disabled={sendingVerification}
                                >
                                    <Mail size={13} aria-hidden="true" />
                                    {sendingVerification ? t("auth.sending") : t("candidate.sendVerificationLink")}
                                </button>
                            )}
                            <span><BriefcaseBusiness size={14} aria-hidden="true" />{t("common.candidate")}</span>
                            <span><CalendarDays size={14} aria-hidden="true" />{t("admin.joined", { date: joinedDate })}</span>
                        </div>
                    </div>
                    <div className="profile-completion">
                        <div className="profile-completion-ring" style={{ "--profile-progress": `${profileCompletion * 3.6}deg` } as React.CSSProperties}>
                            <strong>{profileCompletion}%</strong>
                            <span>{t("candidate.profileCompleteness")}</span>
                        </div>
                        <div className="profile-completion-copy">
                            <strong>{t("candidate.profileStrength")}</strong>
                            <p>{profileCompletion >= 80 ? t("candidate.readyDiscovered") : t("candidate.completeDetails")}</p>
                        </div>
                    </div>
                </section>

                <div className="profile-layout">
                    <section className="profile-card">
                        <div className="profile-card-header">
                            <span className="profile-section-icon blue"><UserRound size={18} aria-hidden="true" /></span>
                            <div><span>{t("candidate.professionalIdentity")}</span><h2>{t("candidate.personalInformation")}</h2></div>
                        </div>

                        <form className="profile-form" onSubmit={handleSaveProfile}>
                            <div className="profile-form-grid">
                                <div className="profile-field">
                                    <label htmlFor="profile-fullName">{t("auth.fullName")}</label>
                                    <input id="profile-fullName" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" maxLength={120} required />
                                    <small>{t("candidate.shownToRecruiters")}</small>
                                </div>
                                <div className="profile-field">
                                    <label htmlFor="profile-email">{t("auth.email")}</label>
                                    <input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={160} required />
                                    <small>{t("admin.usedForSignIn")}</small>
                                </div>
                                <div className="profile-field profile-field-full">
                                    <label htmlFor="profile-headline">{t("auth.headline")}</label>
                                    <input id="profile-headline" type="text" value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="e.g. Java backend developer" maxLength={120} />
                                    <small>{t("candidate.headlineHelp")}</small>
                                </div>
                                <div className="profile-field profile-field-full">
                                    <label htmlFor="profile-industry">{t("auth.industry")}</label>
                                    <input id="profile-industry" type="text" value={industryDomain} onChange={(event) => setIndustryDomain(event.target.value)} placeholder="e.g. Software development" maxLength={100} />
                                </div>
                            </div>

                            <div className="profile-form-footer">
                                <span><Check size={14} aria-hidden="true" /> {t("candidate.savedProfile")}</span>
                                <button type="submit" className="profile-primary-button" disabled={saving}>
                                    <Save size={16} aria-hidden="true" />
                                    {saving ? t("security.saving") : t("common.saveChanges")}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="profile-card profile-cv-card">
                        <div className="profile-card-header">
                            <span className="profile-section-icon violet"><FileText size={18} aria-hidden="true" /></span>
                            <div><span>{t("candidate.recruiterDocument")}</span><h2>{t("candidate.myCv")}</h2></div>
                        </div>

                        {user?.candidateProfile?.cvFilePath ? (
                            <div className="profile-cv-status uploaded">
                                <span><CheckCircle2 size={19} aria-hidden="true" /></span>
                                 <div><strong>{t("candidate.cvUploaded")}</strong><p>{t("candidate.cvAvailable")}</p></div>
                            </div>
                        ) : (
                            <div className="profile-cv-status missing">
                                <span><FileText size={19} aria-hidden="true" /></span>
                                 <div><strong>{t("candidate.noCv")}</strong><p>{t("candidate.uploadCvHelp")}</p></div>
                            </div>
                        )}

                        {user?.candidateProfile?.cvFilePath && (
                            <button type="button" className="profile-secondary-button profile-view-cv" onClick={handleViewCv} disabled={viewingCv}>
                                <Eye size={16} aria-hidden="true" />
                                {viewingCv ? t("common.loading") : t("candidate.viewCurrentCv")}
                            </button>
                        )}

                        <div className="profile-upload-divider"><span>{t("candidate.updateDocument")}</span></div>

                        <label className="profile-upload-zone" htmlFor="cvInput">
                            <span className="profile-upload-icon"><UploadCloud size={21} aria-hidden="true" /></span>
                            <span className="profile-upload-copy">
                                 <strong>{cvFile ? cvFile.name : t("candidate.choosePdf")}</strong>
                                 <small>{cvFile ? t("candidate.readyToUpload") : t("candidate.maxPdf")}</small>
                            </span>
                            <span className="profile-file-chooser">
                                <UploadCloud size={15} aria-hidden="true" />
                                 {cvFile ? t("candidate.changeFile") : t("candidate.chooseFile")}
                            </span>
                            <input className="profile-file-input" id="cvInput" type="file" accept=".pdf,application/pdf" onChange={handleFileChange} />
                        </label>

                        <button type="button" className="profile-primary-button profile-upload-button" onClick={handleUploadCv} disabled={uploading || !cvFile}>
                            <UploadCloud size={16} aria-hidden="true" />
                            {uploading ? t("candidate.uploading") : user?.candidateProfile?.cvFilePath ? t("candidate.changeCv") : t("candidate.uploadCv")}
                        </button>

                        <p className="profile-cv-note">{t("candidate.cvEvidence")}</p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default CandidateProfilePage;
