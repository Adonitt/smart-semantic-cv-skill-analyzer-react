import React, {useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {
    BriefcaseBusiness,
    FileText,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Menu,
    ShieldCheck,
    Sparkles,
    UserRound,
    UsersRound,
    X,
} from "lucide-react";

import {AUTH_CHANGED_EVENT, getRole, getRoleHomePath, getToken, logout,} from "../services/authService";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../i18n/LanguageContext";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [fullName, setFullName] = useState(() => localStorage.getItem("fullName") || "User");
    const { t } = useLanguage();
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

        syncProfileName();
        window.addEventListener("profile-updated", syncProfileName);
        window.addEventListener(AUTH_CHANGED_EVENT, syncProfileName);
        window.addEventListener("storage", syncProfileName);

        return () => {
            window.removeEventListener("profile-updated", syncProfileName);
            window.removeEventListener(AUTH_CHANGED_EVENT, syncProfileName);
            window.removeEventListener("storage", syncProfileName);
        };
    }, []);

    useEffect(() => {
        setFullName(localStorage.getItem("fullName") || "User");
    }, [location.pathname, location.key]);

    if (!token) {
        return null;
    }

    const handleLogout = () => {
        logout();
        setFullName("User");
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
                    aria-label={menuOpen ? t("nav.close") : t("nav.open")}
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
                                        {t("nav.overview")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/candidate/jobs")} to="/candidate/jobs" onClick={closeMenu}>
                                        <BriefcaseBusiness size={15} aria-hidden="true" />
                                        {t("nav.findJobs")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/candidate/applications")} to="/candidate/applications" onClick={closeMenu}>
                                        <FileText size={15} aria-hidden="true" />
                                        {t("nav.applications")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/change-password")} to="/change-password" onClick={closeMenu}>
                                        <LockKeyhole size={15} aria-hidden="true" />
                                        {t("nav.security")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/profile")} to="/profile" onClick={closeMenu}>
                                        <UserRound size={15} aria-hidden="true"/>
                                        {t("nav.profile")}
                                    </Link>
                                </li>
                            </>
                        )}

                        {role === "RECRUITER" && (
                            <>
                                <li className="nav-item">
                                    <Link className={navClass("/recruiter/dashboard")} to="/recruiter/dashboard" onClick={closeMenu}>
                                        <LayoutDashboard size={15} aria-hidden="true" />
                                        {t("nav.overview")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/recruiter/jobs")} to="/recruiter/jobs" onClick={closeMenu}>
                                        <BriefcaseBusiness size={15} aria-hidden="true" />
                                        {t("nav.myJobs")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/change-password")} to="/change-password" onClick={closeMenu}>
                                        <LockKeyhole size={15} aria-hidden="true" />
                                        {t("nav.security")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/recruiter/profile")} to="/recruiter/profile" onClick={closeMenu}>
                                        <UserRound size={15} aria-hidden="true" />
                                        {t("nav.profile")}
                                    </Link>
                                </li>
                            </>
                        )}

                        {role === "ADMIN" && (
                            <>
                                <li className="nav-item">
                                    <Link className={navClass("/admin/dashboard")} to="/admin/dashboard" onClick={closeMenu}>
                                        <ShieldCheck size={15} aria-hidden="true" />
                                        {t("nav.overview")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/admin/users")} to="/admin/users" onClick={closeMenu}>
                                        <UsersRound size={15} aria-hidden="true" />
                                        {t("nav.users")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/admin/jobs")} to="/admin/jobs" onClick={closeMenu}>
                                        <BriefcaseBusiness size={15} aria-hidden="true" />
                                        {t("nav.jobs")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/change-password")} to="/change-password" onClick={closeMenu}>
                                        <LockKeyhole size={15} aria-hidden="true" />
                                        {t("nav.security")}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={navClass("/admin/profile")} to="/admin/profile"
                                          onClick={closeMenu}>
                                        <UserRound size={15} aria-hidden="true"/>
                                        {t("nav.profile")}
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="app-navbar-user">
                        <LanguageSelector />
                        <span className="app-avatar" aria-hidden="true">{initials}</span>
                        <div className="app-user-copy">
                            <strong>{fullName}</strong>
                            <span>{role === "ADMIN" ? t("common.admin") : role === "CANDIDATE" ? t("common.candidate") : role === "RECRUITER" ? t("common.recruiter") : t("common.user")}</span>
                        </div>
                        <button type="button" className="app-logout" onClick={handleLogout}>
                            <LogOut size={16} aria-hidden="true" />
                            <span>{t("nav.logOut")}</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
