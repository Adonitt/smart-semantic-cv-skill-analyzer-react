import React from "react";

const MyApplications: React.FC = () => {
    return (
        <div className="container py-5">
            <h2>My Applications</h2>

            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body">
                    <p className="text-muted">
                        Your applications will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyApplications;