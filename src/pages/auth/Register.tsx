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
            setError("Complete the required fields before creating your account.");
            return;
        }

        if (form.password.length < 8) {
            setError("Your password should contain at least 8 characters.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("The passwords do not match. Check both fields and try again.");
            return;
        }

        if (form.role === "RECRUITER" && (!form.companyName.trim() || !form.positionTitle.trim())) {
            setError("Company name and position title are required for recruiter accounts.");
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
            setSuccess("Account created successfully. Taking you to sign in…");

            window.setTimeout(() => navigate("/login"), 1200);
        } catch (requestError: unknown) {
            console.error(requestError);

            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message ||
                          "We could not create your account. Please try again."
                    : "We could not create your account. Please try again."
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
                            Start with the right context
                        </span>
                        <h1>Build a profile people can understand.</h1>
                        <p>
                            Whether you are building your next career move or your next team, SmartHire keeps the important details clear from the first step.
                        </p>

                        <div className="auth-journey">
                            <div className="auth-journey-step active">
                                <span>01</span>
                                <div><strong>Create your account</strong><small>Tell us who you are.</small></div>
                            </div>
                            <div className="auth-journey-line" />
                            <div className="auth-journey-step">
                                <span>02</span>
                                <div><strong>Add useful context</strong><small>Skills, company or experience.</small></div>
                            </div>
                            <div className="auth-journey-line" />
                            <div className="auth-journey-step">
                                <span>03</span>
                                <div><strong>Make a better match</strong><small>Use evidence to move forward.</small></div>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="auth-panel-shell">
                    <div className="auth-panel auth-panel-register">
                        <div className="auth-panel-heading">
                            <div className="auth-panel-icon">
                                <UserRound size={22} aria-hidden="true" />
                            </div>
                            <span className="auth-panel-kicker">Create your workspace</span>
                            <h2>Join SmartHire</h2>
                            <p>Start with a few details. You can complete your profile later.</p>
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
                                <label htmlFor="register-fullName">Full name</label>
                                <div className="auth-input-wrap">
                                    <UserRound size={17} aria-hidden="true" />
                                    <input
                                        id="register-fullName"
                                        name="fullName"
                                        type="text"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="register-email">Email address</label>
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
                                <span className="auth-field-label">I am joining as</span>
                                <div className="auth-role-grid">
                                    <button
                                        type="button"
                                        className={`auth-role-card ${form.role === "CANDIDATE" ? "active" : ""}`}
                                        onClick={() => handleRoleChange("CANDIDATE")}
                                        aria-pressed={form.role === "CANDIDATE"}
                                    >
                                        <span className="auth-role-icon"><BriefcaseBusiness size={19} aria-hidden="true" /></span>
                                        <span><strong>Candidate</strong><small>Find your next role</small></span>
                                        {form.role === "CANDIDATE" && <CheckCircle2 className="auth-role-check" size={17} aria-hidden="true" />}
                                    </button>
                                    <button
                                        type="button"
                                        className={`auth-role-card ${form.role === "RECRUITER" ? "active" : ""}`}
                                        onClick={() => handleRoleChange("RECRUITER")}
                                        aria-pressed={form.role === "RECRUITER"}
                                    >
                                        <span className="auth-role-icon"><Building2 size={19} aria-hidden="true" /></span>
                                        <span><strong>Recruiter</strong><small>Build your talent pipeline</small></span>
                                        {form.role === "RECRUITER" && <CheckCircle2 className="auth-role-check" size={17} aria-hidden="true" />}
                                    </button>
                                </div>
                            </div>

                            <div className="auth-form-grid">
                                <div className="auth-field">
                                    <label htmlFor="register-password">Password</label>
                                    <div className="auth-input-wrap">
                                        <LockKeyhole size={17} aria-hidden="true" />
                                        <input
                                            id="register-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="At least 8 characters"
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-input-action"
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="register-confirmPassword">Confirm password</label>
                                    <div className="auth-input-wrap">
                                        <LockKeyhole size={17} aria-hidden="true" />
                                        <input
                                            id="register-confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Repeat your password"
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-input-action"
                                            onClick={() => setShowConfirmPassword((visible) => !visible)}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="auth-role-details">
                                <div className="auth-role-details-heading">
                                    <span>{form.role === "CANDIDATE" ? "Candidate profile" : "Recruiter profile"}</span>
                                    <small>{form.role === "CANDIDATE" ? "Optional context for better matching" : "A few details about your company role"}</small>
                                </div>

                                {form.role === "CANDIDATE" ? (
                                    <div className="auth-form-grid">
                                        <div className="auth-field">
                                            <label htmlFor="register-headline">Professional headline <span>Optional</span></label>
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
                                            <label htmlFor="register-industryDomain">Industry <span>Optional</span></label>
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
                                            <label htmlFor="register-companyName">Company name</label>
                                            <div className="auth-input-wrap">
                                                <Building2 size={17} aria-hidden="true" />
                                                <input
                                                    id="register-companyName"
                                                    name="companyName"
                                                    type="text"
                                                    value={form.companyName}
                                                    onChange={handleChange}
                                                    placeholder="Company name"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="auth-field">
                                            <label htmlFor="register-positionTitle">Your position</label>
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
                                            <label htmlFor="register-companyWebsite">Company website <span>Optional</span></label>
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
                                <span>{loading ? "Creating account…" : "Create account"}</span>
                                {!loading && <ArrowRight size={17} aria-hidden="true" />}
                            </button>
                        </form>

                        <div className="auth-panel-footer">
                            <span>Already have an account?</span>
                            <button type="button" onClick={() => navigate("/login")}>
                                Sign in
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
