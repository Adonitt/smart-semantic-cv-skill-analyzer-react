import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {registerUser} from "../../services/authService";
import type {RegisterRequest, RoleEnum} from "../../types/auth";

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

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        const {name, value} = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Password validation
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        // Basic validation
        if (
            !form.fullName ||
            !form.email ||
            !form.password
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        // Recruiter validation
        if (form.role === "RECRUITER") {
            if (
                !form.companyName ||
                !form.positionTitle
            ) {
                setError(
                    "Company name and position title are required for recruiters."
                );
                return;
            }
        }

        try {
            setLoading(true);

            const data: RegisterRequest = {
                email: form.email,
                password: form.password,
                fullName: form.fullName,
                role: form.role,
                confirmPassword: form.confirmPassword,
            };

            // Candidate fields
            if (form.role === "CANDIDATE") {
                data.headline =
                    form.headline || undefined;

                data.industryDomain =
                    form.industryDomain || undefined;
            }

            // Recruiter fields
            if (form.role === "RECRUITER") {
                data.companyName =
                    form.companyName;

                data.companyWebsite =
                    form.companyWebsite || undefined;

                data.positionTitle =
                    form.positionTitle;
            }

            await registerUser(data);

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err: any) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">

            <div className="row justify-content-center">

                <div className="col-md-7 col-lg-6">

                    <div className="card shadow border-0">

                        <div className="card-body p-4">

                            <h2 className="text-center mb-4">
                                Create Account
                            </h2>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                {/* FULL NAME */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        className="form-control"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* EMAIL */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* ROLE */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Register as
                                    </label>

                                    <select
                                        name="role"
                                        className="form-select"
                                        value={form.role}
                                        onChange={handleChange}
                                    >
                                        <option value="CANDIDATE">
                                            Candidate
                                        </option>

                                        <option value="RECRUITER">
                                            Recruiter
                                        </option>
                                    </select>
                                </div>

                                {/* PASSWORD */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                    />
                                </div>

                                {/* CONFIRM PASSWORD */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                    />
                                </div>

                                {/* CANDIDATE FIELDS */}

                                {form.role === "CANDIDATE" && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Headline
                                            </label>

                                            <input
                                                type="text"
                                                name="headline"
                                                className="form-control"
                                                value={form.headline}
                                                onChange={handleChange}
                                                placeholder="e.g. Java Developer"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Industry Domain
                                            </label>

                                            <input
                                                type="text"
                                                name="industryDomain"
                                                className="form-control"
                                                value={form.industryDomain}
                                                onChange={handleChange}
                                                placeholder="e.g. Software Development"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* RECRUITER FIELDS */}

                                {form.role === "RECRUITER" && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Company Name
                                            </label>

                                            <input
                                                type="text"
                                                name="companyName"
                                                className="form-control"
                                                value={form.companyName}
                                                onChange={handleChange}
                                                placeholder="Company name"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Company Website
                                            </label>

                                            <input
                                                type="text"
                                                name="companyWebsite"
                                                className="form-control"
                                                value={form.companyWebsite}
                                                onChange={handleChange}
                                                placeholder="https://example.com"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Position Title
                                            </label>

                                            <input
                                                type="text"
                                                name="positionTitle"
                                                className="form-control"
                                                value={form.positionTitle}
                                                onChange={handleChange}
                                                placeholder="e.g. HR Manager"
                                            />
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Creating account..."
                                        : "Register"}
                                </button>

                            </form>

                            <div className="text-center mt-3">

                <span>
                  Already have an account?{" "}
                </span>

                                <button
                                    className="btn btn-link p-0"
                                    onClick={() =>
                                        navigate("/login")
                                    }
                                >
                                    Login
                                </button>

                            </div>

                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;