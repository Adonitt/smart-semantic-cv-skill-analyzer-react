import React from "react";

const RecruiterDashboard: React.FC = () => {
    return (
        <div className="container py-5">
            <h2>Recruiter Dashboard</h2>

            <p className="text-muted">
                Welcome to your recruiter dashboard.
            </p>

            <div className="row mt-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h5>My Jobs</h5>
                            <p>Manage your published jobs.</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h5>Applications</h5>
                            <p>Review candidate applications.</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h5>Candidates</h5>
                            <p>Review candidate profiles and CVs.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;