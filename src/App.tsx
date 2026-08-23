import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import Jobs from "./pages/candidate/Jobs";
import MyApplications from "./pages/candidate/MyApplications";

import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import Navbar from "./components/Navbar";

import { getToken } from "./services/authService";
import JobDetails from "./pages/candidate/JobDetails";
import CandidateProfile from "./pages/candidate/CandidateProfile";

const App: React.FC = () => {

    const token = getToken();

    return (
        <BrowserRouter>

            {token && <Navbar />}

            <Routes>

                {/* AUTH */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* CANDIDATE */}

                <Route
                    path="/candidate/dashboard"
                    element={
                        token
                            ? <CandidateDashboard />
                            : <Navigate to="/login" />
                    }
                />

                <Route
                    path="/candidate/jobs"
                    element={
                        token
                            ? <Jobs />
                            : <Navigate to="/login" />
                    }
                />

                {/*<Route*/}
                {/*    path="/candidate/jobs/:id"*/}
                {/*    element={*/}
                {/*        token*/}
                {/*            ? <JobDetails />*/}
                {/*            : <Navigate to="/login" />*/}
                {/*    }*/}
                {/*/>*/}

                <Route
                    path="/candidate/applications"
                    element={
                        token
                            ? <MyApplications />
                            : <Navigate to="/login" />
                    }
                />


                {/* RECRUITER */}

                <Route
                    path="/recruiter/dashboard"
                    element={
                        token
                            ? <RecruiterDashboard />
                            : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/profile"
                    element={<CandidateProfile />}
                />

                {/* DEFAULT */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to={
                                token
                                    ? "/candidate/jobs"
                                    : "/login"
                            }
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                token
                                    ? "/candidate/jobs"
                                    : "/login"
                            }
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
};

export default App;