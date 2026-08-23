import React from "react";
import {
    Briefcase,
    Clock,
    MapPin,
    Star,
} from "lucide-react";
import type { Job } from "../types/job";

interface JobCardProps {
    job: Job;
    onDetails: (job: Job) => void;
    hasApplied: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
                                             job,
                                             onDetails,
                                             hasApplied,
                                         }) => {

    return (

        <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

                {/* HEADER */}

                <div className="d-flex justify-content-between align-items-start mb-3">

                    <div>

                        <h5 className="fw-bold mb-1">
                            {job.title}
                        </h5>

                        <p className="text-muted mb-0">
                            {job.companyName}
                        </p>

                    </div>


                    {job.matchPercentage !== null &&
                        job.matchPercentage !== undefined && (

                            <span className="badge bg-success fs-6">
                                {job.matchPercentage.toFixed(1)}%
                                Match
                            </span>

                        )}

                </div>


                {/* INFORMATION */}

                <div className="mb-3">

                    <div className="d-flex align-items-center text-muted mb-2">

                        <MapPin
                            size={16}
                            className="me-2"
                        />

                        {job.location}

                    </div>


                    <div className="d-flex align-items-center text-muted mb-2">

                        <Briefcase
                            size={16}
                            className="me-2"
                        />

                        {job.employmentType}

                    </div>


                    <div className="d-flex align-items-center text-muted">

                        <Clock
                            size={16}
                            className="me-2"
                        />

                        {job.experienceLevel}

                    </div>

                </div>


                {/* DESCRIPTION */}

                <p className="text-muted">

                    {job.description?.length > 120
                        ? `${job.description.substring(
                            0,
                            120
                        )}...`
                        : job.description}

                </p>


                {/* FOOTER */}

                <div className="d-flex justify-content-between align-items-center mt-4">

                    <div>

                        <Star
                            size={16}
                            className="me-1 text-warning"
                        />

                        <span className="fw-semibold">
                            {job.salaryMin} -{" "}
                            {job.salaryMax}
                        </span>

                    </div>


                    <div className="d-flex gap-2">

                        <button
                            className="btn btn-outline-primary"
                            onClick={() =>
                                onDetails(job)
                            }
                        >
                            Details
                        </button>


                        {hasApplied ? (

                            <span className="badge bg-success d-flex align-items-center px-3">
                                Applied ✓
                            </span>

                        ) : (

                            <button
                                className="btn btn-primary"
                                onClick={() =>
                                    onDetails(job)
                                }
                            >
                                Apply
                            </button>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default JobCard;