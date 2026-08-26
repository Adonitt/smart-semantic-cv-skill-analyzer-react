import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertCircle,
    ArrowRight,
    BriefcaseBusiness,
    CheckCircle2,
    Eye,
    EyeOff,
    FileText,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
    UserRound,
} from "lucide-react";

import { loginUser, saveLoginData } from "../../services/authService";
import { useLanguage } from "../../i18n/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError(t("auth.loginRequired"));
            return;
        }

        try {
            setLoading(true);

            const response = await loginUser({
                email: email.trim(),
                password,
            });

            saveLoginData(response);

            if (response.role === "CANDIDATE") {
                navigate("/candidate/dashboard");
            } else if (response.role === "RECRUITER") {
                navigate("/recruiter/dashboard");
            } else {
                navigate("/admin/dashboard");
            }
        } catch (requestError: unknown) {
            console.error(requestError);

            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message ||
                          t("auth.loginError")
                    : t("auth.loginGenericError")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page auth-page-login">
            <div className="auth-layout">
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
                            {t("auth.aiKicker")}
                        </span>
                        <h1>{t("auth.loginAsideTitle")}</h1>
                        <p>{t("auth.loginAsideDescription")}</p>

                        <div className="auth-feature-list">
                            <div className="auth-feature">
                                <span><CheckCircle2 size={16} aria-hidden="true" /></span>
                                <div>
                                    <strong>{t("auth.transparentTitle")}</strong>
                                    <small>{t("auth.transparentDescription")}</small>
                                </div>
                            </div>
                            <div className="auth-feature">
                                <span><FileText size={16} aria-hidden="true" /></span>
                                <div>
                                    <strong>{t("auth.workspaceTitle")}</strong>
                                    <small>{t("auth.workspaceDescription")}</small>
                                </div>
                            </div>
                            <div className="auth-feature">
                                <span><ShieldCheck size={16} aria-hidden="true" /></span>
                                <div>
                                    <strong>{t("auth.humanTitle")}</strong>
                                    <small>{t("auth.humanDescription")}</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="auth-aside-footer">
                        <span className="auth-aside-footer-icon">
                            <BriefcaseBusiness size={14} aria-hidden="true" />
                        </span>
                        <span>{t("auth.loginAsideFooter")}</span>
                    </div>
                </aside>

                <section className="auth-panel-shell">
                    <div className="auth-panel">
                        <div className="auth-panel-topbar">
                            <LanguageSelector />
                        </div>
                        <div className="auth-panel-heading">
                            <div className="auth-panel-icon">
                                <UserRound size={22} aria-hidden="true" />
                            </div>
                            <span className="auth-panel-kicker">{t("auth.welcomeBack")}</span>
                            <h2>{t("auth.signInTitle")}</h2>
                            <p>{t("auth.signInDescription")}</p>
                        </div>

                        {error && (
                            <div className="auth-alert auth-alert-error" role="alert">
                                <AlertCircle size={18} aria-hidden="true" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="auth-field">
                                <label htmlFor="login-email">{t("auth.email")}</label>
                                <div className="auth-input-wrap">
                                    <Mail size={17} aria-hidden="true" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <div className="auth-label-row">
                                    <label htmlFor="login-password">{t("auth.password")}</label>
                                    <Link className="auth-forgot-link" to="/forgot-password">
                                        {t("auth.forgotPassword")}
                                    </Link>
                                </div>
                                <div className="auth-input-wrap">
                                    <LockKeyhole size={17} aria-hidden="true" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder={t("auth.passwordPlaceholder")}
                                        autoComplete="current-password"
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

                            <button type="submit" className="auth-submit" disabled={loading}>
                                <span>{loading ? t("auth.signingIn") : t("auth.signIn")}</span>
                                {!loading && <ArrowRight size={17} aria-hidden="true" />}
                            </button>
                        </form>

                        <div className="auth-panel-footer">
                            <span>{t("auth.newTo")}</span>
                            <button type="button" onClick={() => navigate("/register")}>
                                {t("auth.createAccount")}
                                <ArrowRight size={14} aria-hidden="true" />
                            </button>
                        </div>

                        <p className="auth-footnote">
                            {t("auth.terms")}
                        </p>
                        <p className="auth-footnote auth-verification-note">
                            {t("auth.noVerification")} <Link to="/resend-verification">{t("auth.sendAgain")}</Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Login;
