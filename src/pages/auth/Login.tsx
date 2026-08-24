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

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Enter your email and password to continue.");
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
                          "We could not sign you in. Check your details and try again."
                    : "We could not sign you in. Please try again."
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
                            AI-powered recruitment
                        </span>
                        <h1>Find work that fits your real skills.</h1>
                        <p>
                            SmartHire connects candidates with meaningful opportunities and gives recruiters clearer evidence to make better decisions.
                        </p>

                        <div className="auth-feature-list">
                            <div className="auth-feature">
                                <span><CheckCircle2 size={16} aria-hidden="true" /></span>
                                <div>
                                    <strong>Transparent matching</strong>
                                    <small>See matched, related and missing skills.</small>
                                </div>
                            </div>
                            <div className="auth-feature">
                                <span><FileText size={16} aria-hidden="true" /></span>
                                <div>
                                    <strong>One application workspace</strong>
                                    <small>Track every role and its current status.</small>
                                </div>
                            </div>
                            <div className="auth-feature">
                                <span><ShieldCheck size={16} aria-hidden="true" /></span>
                                <div>
                                    <strong>Built for human decisions</strong>
                                    <small>AI supports review; people stay in control.</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="auth-aside-footer">
                        <span className="auth-aside-footer-icon">
                            <BriefcaseBusiness size={14} aria-hidden="true" />
                        </span>
                        <span>One place for better career decisions.</span>
                    </div>
                </aside>

                <section className="auth-panel-shell">
                    <div className="auth-panel">
                        <div className="auth-panel-heading">
                            <div className="auth-panel-icon">
                                <UserRound size={22} aria-hidden="true" />
                            </div>
                            <span className="auth-panel-kicker">Welcome back</span>
                            <h2>Sign in to SmartHire</h2>
                            <p>Continue where you left off.</p>
                        </div>

                        {error && (
                            <div className="auth-alert auth-alert-error" role="alert">
                                <AlertCircle size={18} aria-hidden="true" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="auth-field">
                                <label htmlFor="login-email">Email address</label>
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
                                    <label htmlFor="login-password">Password</label>
                                    <span className="auth-field-note">Keep it private</span>
                                </div>
                                <div className="auth-input-wrap">
                                    <LockKeyhole size={17} aria-hidden="true" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
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

                            <button type="submit" className="auth-submit" disabled={loading}>
                                <span>{loading ? "Signing in…" : "Sign in"}</span>
                                {!loading && <ArrowRight size={17} aria-hidden="true" />}
                            </button>
                        </form>

                        <div className="auth-panel-footer">
                            <span>New to SmartHire?</span>
                            <button type="button" onClick={() => navigate("/register")}>
                                Create an account
                                <ArrowRight size={14} aria-hidden="true" />
                            </button>
                        </div>

                        <p className="auth-footnote">
                            By continuing, you agree to use matching insights as guidance and review opportunities carefully.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Login;
