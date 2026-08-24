import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { getMyApplications } from "../../services/applicationService";
import type { Application } from "../../types/application";
import {
    DashboardShell,
    EmptyState,
    ErrorState,
    formatDate,
    SectionCard,
    StatusBadge,
} from "../../components/dashboard/DashboardPrimitives";

const MyApplications: React.FC = () => {
    const [applications, setApplications] = useState<Application[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadApplications = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setApplications(await getMyApplications());
        } catch (loadError) {
            console.error("Failed to load applications:", loadError);
            setApplications(null);
            setError("Your applications could not be loaded right now.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadApplications();
    }, [loadApplications]);

    return (
        <DashboardShell
            eyebrow="Candidate workspace"
            title="My applications"
            description="Track application status and see the matching information returned by the system."
            actions={
                <Link to="/candidate/jobs" className="btn btn-primary">
                    <Search size={17} aria-hidden="true" />
                    Browse jobs
                </Link>
            }
        >
            {error && <ErrorState message={error} onRetry={() => void loadApplications()} />}

            <SectionCard title="Application history" description="Your applications, newest first.">
                {loading && <div className="dashboard-state">Loading applications…</div>}
                {!loading && applications && applications.length === 0 && (
                    <EmptyState
                        title="No applications yet"
                        description="Find a role that matches your skills and submit your first application."
                        action={
                            <Link to="/candidate/jobs" className="btn btn-primary btn-sm">
                                <Search size={15} aria-hidden="true" />
                                Find a job
                            </Link>
                        }
                    />
                )}
                {!loading && applications && applications.length > 0 && (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th scope="col">Position</th>
                                    <th scope="col">Applied</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">AI match</th>
                                    <th scope="col">Skills</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...applications]
                                    .sort(
                                        (first, second) =>
                                            new Date(second.appliedAt).getTime() -
                                            new Date(first.appliedAt).getTime()
                                    )
                                    .map((application) => (
                                        <tr key={application.id}>
                                            <td>
                                                <span className="dashboard-primary-cell">{application.jobTitle}</span>
                                                <span className="dashboard-secondary-cell">
                                                    {application.companyName || "Company not provided"}
                                                </span>
                                            </td>
                                            <td>{formatDate(application.appliedAt)}</td>
                                            <td><StatusBadge status={application.status} /></td>
                                            <td>
                                                {application.matchPercentage === null ||
                                                application.matchPercentage === undefined
                                                    ? "Not available"
                                                    : `${application.matchPercentage.toFixed(1)}%`}
                                            </td>
                                            <td>
                                                {application.matchedSkills?.length
                                                    ? `${application.matchedSkills.length} matched`
                                                    : "Not available"}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            <p className="dashboard-kpi-note d-flex align-items-center gap-2">
                <FileText size={15} aria-hidden="true" />
                Matching data is informational and does not replace recruiter review.
            </p>

            <Link to="/candidate/dashboard" className="dashboard-link d-inline-flex align-items-center gap-1 mt-2">
                <ArrowLeft size={15} aria-hidden="true" />
                Back to dashboard
            </Link>
        </DashboardShell>
    );
};

export default MyApplications;
