import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {getRole, getToken, logout} from "../services/authService";

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    const token = getToken();
    const role = getRole();

    const fullName = localStorage.getItem("fullName");
    const userId = localStorage.getItem("userId");

    // Don't show navbar when user is not logged in
    if (!token) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">

                <Link
                    className="navbar-brand fw-bold"
                    to="/candidate/dashboard"
                >
                    SmartHire
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbarContent"
                >

                    <ul className="navbar-nav me-auto">

                        {/* ============================= */}
                        {/* CANDIDATE MENU */}
                        {/* ============================= */}

                        {/* CANDIDATE MENU */}
                        {role === "CANDIDATE" && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/candidate/jobs"
                                    >
                                        Jobs
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/candidate/applications"
                                    >
                                        My Applications
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/profile"
                                    >
                                        My Profile
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* ============================= */}
                        {/* RECRUITER MENU */}
                        {/* ============================= */}

                        {role === "RECRUITER" && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/recruiter/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/recruiter/jobs/create"
                                    >
                                        Create Job
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/profile"
                                    >
                                        My Profile
                                    </Link>
                                </li>
                            </>
                        )}

                    </ul>

                    {/* ============================= */}
                    {/* USER INFO */}
                    {/* ============================= */}

                    <div className="d-flex align-items-center gap-3">

                        <span className="text-white">
                            {fullName || "User"}
                        </span>

                        <button
                            className="btn btn-outline-light btn-sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;