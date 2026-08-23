
import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";

interface CandidateProfile {
    id: number;
    headline?: string | null;
    industryDomain?: string | null;
    cvFilePath?: string | null;
}

interface UserDetails {
    id: number;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
    candidateProfile?: CandidateProfile | null;
}

const CandidateProfilePage: React.FC = () => {

    const userId = localStorage.getItem("userId");

    const [user, setUser] = useState<UserDetails | null>(null);

    const [headline, setHeadline] = useState("");
    const [industryDomain, setIndustryDomain] = useState("");

    const [cvFile, setCvFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewingCv, setViewingCv] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =====================================================
    // LOAD PROFILE
    // =====================================================

    const loadProfile = async () => {

        if (!userId) {
            setError("User ID not found.");
            setLoading(false);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get<UserDetails>(
                    `/users/${userId}`
                );

            setUser(response.data);

            setHeadline(
                response.data.candidateProfile?.headline || ""
            );

            setIndustryDomain(
                response.data.candidateProfile?.industryDomain || ""
            );

        } catch (err: unknown) {

            console.error(err);

            if (axios.isAxiosError(err)) {

                setError(
                    err.response?.data?.message ||
                    "Failed to load profile."
                );

            } else {

                setError("Failed to load profile.");

            }

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // LOAD PROFILE ON PAGE OPEN
    // =====================================================

    useEffect(() => {

        loadProfile();

    }, [userId]);


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const handleSaveProfile = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await api.put(
                "/candidate/profile",
                {
                    headline: headline.trim(),
                    industryDomain: industryDomain.trim()
                }
            );

            setSuccess("Profile updated successfully!");

        } catch (err: unknown) {

            console.error(err);

            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                    "Failed to update profile."
                );
            } else {
                setError("Failed to update profile.");
            }

        } finally {
            setSaving(false);
        }
    };



    // =====================================================
    // SELECT CV
    // =====================================================

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Check PDF
        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {

            setError(
                "Only PDF files are allowed."
            );

            setCvFile(null);

            return;
        }

        setError("");
        setSuccess("");
        setCvFile(file);
    };


    // =====================================================
    // UPLOAD / CHANGE CV
    // =====================================================

    const handleUploadCv = async () => {

        if (!cvFile) {

            setError(
                "Please select a PDF CV."
            );

            return;
        }

        try {

            setUploading(true);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append(
                "file",
                cvFile
            );

            await api.post(
                "/cv/upload",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            setSuccess(
                user?.candidateProfile?.cvFilePath
                    ? "CV changed successfully!"
                    : "CV uploaded successfully!"
            );

            setCvFile(null);

            // Reset file input
            const fileInput =
                document.getElementById(
                    "cvInput"
                ) as HTMLInputElement | null;

            if (fileInput) {
                fileInput.value = "";
            }

            // Reload profile
            await loadProfile();

        } catch (err: unknown) {

            console.error(err);

            if (axios.isAxiosError(err)) {

                setError(
                    err.response?.data?.message ||
                    "Failed to upload CV."
                );

            } else {

                setError(
                    "Failed to upload CV."
                );

            }

        } finally {

            setUploading(false);

        }
    };


    // =====================================================
    // VIEW MY CV
    // =====================================================

    const handleViewCv = async () => {

        try {

            setViewingCv(true);
            setError("");

            const response =
                await api.get(
                    "/cv/me",
                    {
                        responseType: "blob"
                    }
                );

            // Create temporary URL for PDF
            const fileURL =
                window.URL.createObjectURL(
                    new Blob(
                        [response.data],
                        {
                            type: "application/pdf"
                        }
                    )
                );

            // Open PDF in new tab
            window.open(
                fileURL,
                "_blank"
            );

            // Release URL after a short delay
            setTimeout(() => {

                window.URL.revokeObjectURL(
                    fileURL
                );

            }, 10000);

        } catch (err: unknown) {

            console.error(err);

            if (axios.isAxiosError(err)) {

                setError(
                    err.response?.data?.message ||
                    "Failed to open CV."
                );

            } else {

                setError(
                    "Failed to open CV."
                );

            }

        } finally {

            setViewingCv(false);

        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="container py-5">

                <div className="text-center">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <p className="text-muted mt-2">
                        Loading profile...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="container py-5">

            {/* PAGE HEADER */}

            <div className="mb-4">

                <h2 className="fw-bold">
                    My Profile
                </h2>

                <p className="text-muted">
                    Manage your personal information and CV.
                </p>

            </div>


            {/* ERROR */}

            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {/* SUCCESS */}

            {success && (

                <div className="alert alert-success">

                    {success}

                </div>

            )}


            <div className="row g-4">


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <div className="col-lg-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <h4 className="fw-bold mb-4">
                                Personal Information
                            </h4>


                            {/* FULL NAME */}

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={
                                        user?.fullName || ""
                                    }
                                    disabled
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    className="form-control"
                                    value={
                                        user?.email || ""
                                    }
                                    disabled
                                />

                            </div>


                            {/* ROLE */}

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Role
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={
                                        user?.role || ""
                                    }
                                    disabled
                                />

                            </div>


                            <form
                                onSubmit={
                                    handleSaveProfile
                                }
                            >

                                {/* HEADLINE */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Headline
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Java Backend Developer"
                                        value={headline}
                                        onChange={(e) =>
                                            setHeadline(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* INDUSTRY */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Industry Domain
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Software Development"
                                        value={
                                            industryDomain
                                        }
                                        onChange={(e) =>
                                            setIndustryDomain(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* SAVE */}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Profile"
                                    }

                                </button>

                            </form>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CV
                ================================================= */}

                <div className="col-lg-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <h4 className="fw-bold mb-4">
                                My CV
                            </h4>


                            {/* =================================================
                                CV EXISTS
                            ================================================= */}

                            {user?.candidateProfile?.cvFilePath ? (

                                <div>

                                    <div className="alert alert-success">

                                        <strong>
                                            CV uploaded
                                        </strong>

                                        <p className="mb-0 mt-1">
                                            Your CV is available
                                            and can be viewed below.
                                        </p>

                                    </div>


                                    {/* VIEW CV */}

                                    <button
                                        type="button"
                                        className="btn btn-outline-primary me-2"
                                        onClick={
                                            handleViewCv
                                        }
                                        disabled={
                                            viewingCv
                                        }
                                    >

                                        {viewingCv
                                            ? "Opening..."
                                            : "View My CV"
                                        }

                                    </button>

                                </div>

                            ) : (

                                <div className="alert alert-warning">

                                    You have not uploaded
                                    a CV yet.

                                </div>

                            )}


                            <hr />


                            {/* =================================================
                                UPLOAD / CHANGE CV
                            ================================================= */}

                            <h6 className="fw-bold mb-3">

                                {user?.candidateProfile?.cvFilePath
                                    ? "Change CV"
                                    : "Upload CV"
                                }

                            </h6>


                            <input
                                id="cvInput"
                                type="file"
                                className="form-control mb-3"
                                accept=".pdf,application/pdf"
                                onChange={
                                    handleFileChange
                                }
                            />


                            {/* SELECTED FILE */}

                            {cvFile && (

                                <div className="alert alert-info">

                                    Selected file:

                                    <strong className="ms-1">
                                        {cvFile.name}
                                    </strong>

                                </div>

                            )}


                            {/* UPLOAD */}

                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={
                                    handleUploadCv
                                }
                                disabled={
                                    uploading ||
                                    !cvFile
                                }
                            >

                                {uploading
                                    ? "Uploading..."
                                    : user?.candidateProfile?.cvFilePath
                                        ? "Change CV"
                                        : "Upload CV"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CandidateProfilePage;

