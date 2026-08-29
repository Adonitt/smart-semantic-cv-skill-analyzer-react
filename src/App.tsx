import React from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import MatchManual from "./components/MatchManual";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChangePassword from "./pages/auth/ChangePassword";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ResendVerification from "./pages/auth/ResendVerification";
import VerifyEmail from "./pages/auth/VerifyEmail";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import Jobs from "./pages/job/Jobs";
import MyApplications from "./pages/candidate/MyApplications";
import CreateJob from "./pages/recruiter/CreateJob";
import JobApplications from "./pages/recruiter/JobApplications";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterJobDetails from "./pages/recruiter/RecruiterJobDetails";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import { getRole, getRoleHomePath, getToken } from "./services/authService";

const AppRoutes: React.FC = () => {
    // Reading location makes this component refresh after login navigation,
    // so the navbar and protected routes see the newly stored auth data.
    useLocation();

    const token = getToken();
    const role = getRole();

    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/resend-verification" element={<ResendVerification />} />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute allowedRoles={["CANDIDATE", "RECRUITER", "ADMIN"]}>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                            <CandidateDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/candidate/jobs"
                    element={
                        <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                            <Jobs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/candidate/applications"
                    element={
                        <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                            <MyApplications />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                            <CandidateProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recruiter/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["RECRUITER"]}>
                            <RecruiterDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter/jobs/create"
                    element={
                        <ProtectedRoute allowedRoles={["RECRUITER"]}>
                            <CreateJob />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter/jobs"
                    element={
                        <ProtectedRoute allowedRoles={["RECRUITER"]}>
                            <RecruiterJobs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter/jobs/:jobId/edit"
                    element={
                        <ProtectedRoute allowedRoles={["RECRUITER"]}>
                            <CreateJob />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter/jobs/:jobId"
                    element={
                        <ProtectedRoute allowedRoles={["RECRUITER"]}>
                            <RecruiterJobDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter/jobs/:jobId/applications"
                    element={
                        <ProtectedRoute allowedRoles={["RECRUITER"]}>
                            <JobApplications />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter/profile"
                    element={
                        <ProtectedRoute allowedRoles={["RECRUITER"]}>
                            <RecruiterProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/profile"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminUsers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/jobs"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminJobs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        <Navigate
                            to={token ? getRoleHomePath(role) : "/login"}
                            replace
                        />
                    }
                />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={token ? getRoleHomePath(role) : "/login"}
                            replace
                        />
                    }
                />
            </Routes>
            <MatchManual />
        </>
    );
};

const App: React.FC = () => (
    <BrowserRouter>
        <AppRoutes />
    </BrowserRouter>
);

export default App;
