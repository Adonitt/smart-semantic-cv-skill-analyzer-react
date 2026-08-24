import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";

import { getRole, getRoleHomePath, getToken, logout } from "../services/authService";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [fullName, setFullName] = useState(() => localStorage.getItem("fullName") || "User");
    const token = getToken();
    const role = getRole();
    const homePath = getRoleHomePath(role);
    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U";

    useEffect(() => {
        const syncProfileName = () => {
            setFullName(localStorage.getItem("fullName") || "User");
        };

        window.addEventListener("profile-updated", syncProfileName);
        return () => window.removeEventListener("profile-updated", syncProfileName);
    }, []);

    if (!token) {
        return null;
    }

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate("/login");
    };

    const navClass = (path: string) =>
        `app-nav-link${location.pathname === path ? " active" : ""}`;

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar navbar-expand-lg app-navbar">
            <div className="container app-navbar-container">
                <Link className="app-brand" to={homePath}>
                    <span className="app-brand-mark">
                        <Sparkles size={17} aria-hidden="true" />
                    </span>
                    SmartHire
                </Link>

                <button
                    className="navbar-toggler app-navbar-toggler"
                    type="button"
                    aria-controls="navbarContent"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
                </button>

                <div className={`collapse navbar-collapse app-navbar-content${menuOpen ? " is-open" : ""}`} id="navbarContent">
                    <ul className="navbar-nav app-navbar-nav">
                        {role === "CANDIDATE" && (
                            <>
                                <li className="nav-item">
                                    <Link className={navClass("/candidate/dashboard")} to="/candidate/dashboard" onClick={closeMenu}>
                                        <LayoutDashboard size={15} aria-hidden="true" />
                                        Overview
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/candidate/jobs")} to="/candidate/jobs" onClick={closeMenu}>
                                        <BriefcaseBusiness size={15} aria-hidden="true" />
                                        Find jobs
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/candidate/applications")} to="/candidate/applications" onClick={closeMenu}>
                                        <FileText size={15} aria-hidden="true" />
                                        Applications
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/profile")} to="/profile" onClick={closeMenu}>
                                        <UserRound size={15} aria-hidden="true" />
                                        Profile
                                    </Link>
                                </li>
                            </>
                        )}

                        {role === "RECRUITER" && (
                            <>
                                <li className="nav-item">
                                    <Link className={navClass("/recruiter/dashboard")} to="/recruiter/dashboard" onClick={closeMenu}>
                                        <LayoutDashboard size={15} aria-hidden="true" />
                                        Overview
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/recruiter/jobs")} to="/recruiter/jobs" onClick={closeMenu}>
                                        <BriefcaseBusiness size={15} aria-hidden="true" />
                                        My jobs
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/recruiter/profile")} to="/recruiter/profile" onClick={closeMenu}>
                                        <UserRound size={15} aria-hidden="true" />
                                        Profile
                                    </Link>
                                </li>
                            </>
                        )}

                        {role === "ADMIN" && (
                            <li className="nav-item">
                                <Link className={navClass("/admin/dashboard")} to="/admin/dashboard" onClick={closeMenu}>
                                    <ShieldCheck size={15} aria-hidden="true" />
                                    Overview
                                </Link>
                            </li>
                        )}
                    </ul>

                    <div className="app-navbar-user">
                        <span className="app-avatar" aria-hidden="true">{initials}</span>
                        <div className="app-user-copy">
                            <strong>{fullName}</strong>
                            <span>{role ? role.toLowerCase() : "user"}</span>
                        </div>
                        <button type="button" className="app-logout" onClick={handleLogout}>
                            <LogOut size={16} aria-hidden="true" />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
