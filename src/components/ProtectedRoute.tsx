import React from "react";
import { Navigate } from "react-router-dom";
import { getRole } from "../services/authService";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                           allowedRoles
                                                       }) => {

    const token = localStorage.getItem("token");
    const role = getRole();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (
        allowedRoles &&
        (!role || !allowedRoles.includes(role))
    ) {
        if (role === "CANDIDATE") {
            return (
                <Navigate
                    to="/candidate/dashboard"
                    replace
                />
            );
        }

        if (role === "RECRUITER") {
            return (
                <Navigate
                    to="/recruiter/dashboard"
                    replace
                />
            );
        }

        if (role === "ADMIN") {
            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );
        }

        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
