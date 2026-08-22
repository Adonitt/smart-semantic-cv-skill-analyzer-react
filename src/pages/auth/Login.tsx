import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    loginUser,
    saveLoginData,
} from "../../services/authService";

const Login: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] =
        useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError(
                "Please enter email and password."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await loginUser({
                email,
                password,
            });

            saveLoginData(response);

            // Redirect based on role
            if (response.role === "CANDIDATE") {
                navigate("/candidate");
            } else if (
                response.role === "RECRUITER"
            ) {
                navigate("/recruiter");
            } else {
                navigate("/");
            }

        } catch (err: any) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">

            <div className="row justify-content-center">

                <div className="col-md-5">

                    <div className="card shadow border-0">

                        <div className="card-body p-4">

                            <h2 className="text-center mb-4">
                                Login
                            </h2>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Enter your email"
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Login"}
                                </button>

                            </form>

                            <div className="text-center mt-3">

                <span>
                  Don't have an account?{" "}
                </span>

                                <button
                                    className="btn btn-link p-0"
                                    onClick={() =>
                                        navigate("/register")
                                    }
                                >
                                    Register
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;