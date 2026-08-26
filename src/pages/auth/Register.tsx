import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertCircle,
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    Globe2,
    LockKeyhole,
    Mail,
    Sparkles,
    UserRound,
} from "lucide-react";

import { registerUser } from "../../services/authService";
import type { RegisterRequest, RoleEnum } from "../../types/auth";
import { useLanguage } from "../../i18n/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector";

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "CANDIDATE" as RoleEnum,
        companyName: "",
        companyWebsite: "",
        positionTitle: "",
        headline: "",
        industryDomain: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleRoleChange = (role: RoleEnum) => {
        setError("");
        setForm((current) => ({ ...current, role }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!form.fullName.trim() || !form.email.trim() || !form.password) {
            setError(t("auth.requiredRegister"));
            return;
        }

        if (form.password.length < 8) {
            setError(t("auth.passwordLength"));
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError(t("auth.passwordMismatch"));
            return;
        }

        if (form.role === "RECRUITER" && (!form.companyName.trim() || !form.positionTitle.trim())) {
            setError(t("auth.recruiterRequired"));
            return;
        }

        try {
            setLoading(true);

            const data: RegisterRequest = {
                email: form.email.trim(),
                password: form.password,
                confirmPassword: form.confirmPassword,
                fullName: form.fullName.trim(),
                role: form.role,
            };

            if (form.role === "CANDIDATE") {
                data.headline = form.headline.trim() || undefined;
                data.industryDomain = form.industryDomain.trim() || undefined;
            }

            if (form.role === "RECRUITER") {
                data.companyName = form.companyName.trim();
                data.companyWebsite = form.companyWebsite.trim() || undefined;
                data.positionTitle = form.positionTitle.trim();
            }

            await registerUser(data);
            setSuccess(t("auth.registerSuccess"));

            window.setTimeout(() => navigate("/login"), 2600);
        } catch (requestError: unknown) {
            console.error(requestError);

            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message ||
                          t("auth.registerError")
                    : t("auth.registerError")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page auth-page-register">
            <div className="auth-layout auth-layout-register">
                <aside className="auth-aside">
                    <Link to="/login" className="auth-brand">
                        <span className="auth-brand-mark">
                            <Sparkles size={18} aria-hidden="true" />
                        </span>
                        SmartHire
                    </Link>

                    <div className="auth-aside-content">
                        <span className="auth-eyebrow">
                            <Sparkles size={14} aria-hidden="true" />
                            {t("auth.registerKicker")}
                        </span>
                        <h1>{t("auth.registerAsideTitle")}</h1>
                        <p>{t("auth.registerAsideDescription")}</p>

                        <div className="auth-journey">
                            <div className="auth-journey-step active">
                                <span>01</span>
                                <div><strong>{t("auth.registerStepOne")}</strong><small>{t("auth.registerStepOneDescription")}</small></div>
                            </div>
                            <div className="auth-journey-line" />
                            <div className="auth-journey-step">
                                <span>02</span>
                                <div><strong>{t("auth.registerStepTwo")}</strong><small>{t("auth.registerStepTwoDescription")}</small></div>
                            </div>
                            <div className="auth-journey-line" />
                            <div className="auth-journey-step">
                                <span>03</span>
                                <div><strong>{t("auth.registerStepThree")}</strong><small>{t("auth.registerStepThreeDescription")}</small></div>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="auth-panel-shell">
                    <div className="auth-panel auth-panel-register">
                        <div className="auth-panel-topbar">
                            <LanguageSelector />
                        </div>
                        <div className="auth-panel-heading">
                            <div className="auth-panel-icon">
                                <UserRound size={22} aria-hidden="true" />
                            </div>
                            <span className="auth-panel-kicker">{t("auth.createWorkspace")}</span>
                            <h2>{t("auth.joinTitle")}</h2>
                            <p>{t("auth.joinDescription")}</p>
                        </div>

                        {error && (
                            <div className="auth-alert auth-alert-error" role="alert">
                                <AlertCircle size={18} aria-hidden="true" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="auth-alert auth-alert-success" role="status">
                                <CheckCircle2 size={18} aria-hidden="true" />
                                <span>{success}</span>
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="auth-field">
                                <label htmlFor="register-fullName">{t("auth.fullName")}</label>
                                <div className="auth-input-wrap">
                                    <UserRound size={17} aria-hidden="true" />
                                    <input
                                        id="register-fullName"
                                        name="fullName"
                                        type="text"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder={t("auth.fullNamePlaceholder")}
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="register-email">{t("auth.email")}</label>
                                <div className="auth-input-wrap">
                                    <Mail size={17} aria-hidden="true" />
                                    <input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <span className="auth-field-label">{t("auth.joiningAs")}</span>
                                <div className="auth-role-grid">
                                    <button
                                        type="button"
                                        className={`auth-role-card ${form.role === "CANDIDATE" ? "active" : ""}`}
                                        onClick={() => handleRoleChange("CANDIDATE")}
                                        aria-pressed={form.role === "CANDIDATE"}
                                    >
                                        <span className="auth-role-icon"><BriefcaseBusiness size={19} aria-hidden="true" /></span>
                                        <span><strong>{t("auth.candidate")}</strong><small>{t("auth.candidateHint")}</small></span>
                                        {form.role === "CANDIDATE" && <CheckCircle2 className="auth-role-check" size={17} aria-hidden="true" />}
                                    </button>
                                    <button
                                        type="button"
                                        className={`auth-role-card ${form.role === "RECRUITER" ? "active" : ""}`}
                                        onClick={() => handleRoleChange("RECRUITER")}
                                        aria-pressed={form.role === "RECRUITER"}
                                    >
                                        <span className="auth-role-icon"><Building2 size={19} aria-hidden="true" /></span>
                                        <span><strong>{t("auth.recruiter")}</strong><small>{t("auth.recruiterHint")}</small></span>
                                        {form.role === "RECRUITER" && <CheckCircle2 className="auth-role-check" size={17} aria-hidden="true" />}
                                    </button>
                                </div>
                            </div>

                            <div className="auth-form-grid">
                                <div className="auth-field">
                                    <label htmlFor="register-password">{t("auth.password")}</label>
                                    <div className="auth-input-wrap">
                                        <LockKeyhole size={17} aria-hidden="true" />
                                        <input
                                            id="register-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder={t("security.atLeast8")}
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-input-action"
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            aria-label={showPassword ? t("security.hidePassword") : t("security.showPassword")}
                                        >
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="register-confirmPassword">{t("auth.confirmPassword")}</label>
                                    <div className="auth-input-wrap">
                                        <LockKeyhole size={17} aria-hidden="true" />
                                        <input
                                            id="register-confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder={t("auth.confirmPassword")}
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-input-action"
                                            onClick={() => setShowConfirmPassword((visible) => !visible)}
                                            aria-label={showConfirmPassword ? t("security.hidePassword") : t("security.showPassword")}
                                        >
                                            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="auth-role-details">
                                <div className="auth-role-details-heading">
                                    <span>{form.role === "CANDIDATE" ? `${t("auth.candidate")} ${t("nav.profile")}` : `${t("auth.recruiter")} ${t("nav.profile")}`}</span>
                                    <small>{form.role === "CANDIDATE" ? t("auth.transparentDescription") : t("auth.recruiterHint")}</small>
                                </div>

                                {form.role === "CANDIDATE" ? (
                                    <div className="auth-form-grid">
                                        <div className="auth-field">
                                            <label htmlFor="register-headline">{t("auth.headline")} <span>{t("auth.optional")}</span></label>
                                            <input
                                                id="register-headline"
                                                name="headline"
                                                type="text"
                                                className="auth-plain-input"
                                                value={form.headline}
                                                onChange={handleChange}
                                                placeholder="e.g. Java backend developer"
                                            />
                                        </div>
                                        <div className="auth-field">
                                            <label htmlFor="register-industryDomain">{t("auth.industry")} <span>{t("auth.optional")}</span></label>
                                            <input
                                                id="register-industryDomain"
                                                name="industryDomain"
                                                type="text"
                                                className="auth-plain-input"
                                                value={form.industryDomain}
                                                onChange={handleChange}
                                                placeholder="e.g. Software development"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="auth-form-grid">
                                        <div className="auth-field">
                                            <label htmlFor="register-companyName">{t("auth.companyName")}</label>
                                            <div className="auth-input-wrap">
                                                <Building2 size={17} aria-hidden="true" />
                                                <input
                                                    id="register-companyName"
                                                    name="companyName"
                                                    type="text"
                                                    value={form.companyName}
                                                    onChange={handleChange}
                                                    placeholder={t("auth.companyName")}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="auth-field">
                                            <label htmlFor="register-positionTitle">{t("auth.positionTitle")}</label>
                                            <input
                                                id="register-positionTitle"
                                                name="positionTitle"
                                                type="text"
                                                className="auth-plain-input"
                                                value={form.positionTitle}
                                                onChange={handleChange}
                                                placeholder="e.g. HR manager"
                                                required
                                            />
                                        </div>
                                        <div className="auth-field auth-field-full">
                                            <label htmlFor="register-companyWebsite">{t("auth.companyWebsite")} <span>{t("auth.optional")}</span></label>
                                            <div className="auth-input-wrap">
                                                <Globe2 size={17} aria-hidden="true" />
                                                <input
                                                    id="register-companyWebsite"
                                                    name="companyWebsite"
                                                    type="url"
                                                    value={form.companyWebsite}
                                                    onChange={handleChange}
                                                    placeholder="https://company.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="auth-submit" disabled={loading}>
                                <span>{loading ? t("auth.creating") : t("auth.createButton")}</span>
                                {!loading && <ArrowRight size={17} aria-hidden="true" />}
                            </button>
                        </form>

                        <div className="auth-panel-footer">
                            <span>{t("auth.alreadyAccount")}</span>
                            <button type="button" onClick={() => navigate("/login")}>
                                {t("auth.signIn")}
                                <ArrowRight size={14} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Register;
