import React from "react";

interface LoadingProps {
    text?: string;
}

const Loading: React.FC<LoadingProps> = ({
                                             text = "Loading..."
                                         }) => {
    return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <div
                className="spinner-border text-primary"
                role="status"
            >
                <span className="visually-hidden">
                    Loading...
                </span>
            </div>

            <span className="ms-3">
                {text}
            </span>
        </div>
    );
};

export default Loading;