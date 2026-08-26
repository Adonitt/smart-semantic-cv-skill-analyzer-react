import React from "react";
import { useLanguage } from "../i18n/LanguageContext";

interface LoadingProps {
    text?: string;
}

const Loading: React.FC<LoadingProps> = ({ text }) => {
    const { t } = useLanguage();
    const loadingText = text || t("common.loading");

    return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <div
                className="spinner-border text-primary"
                role="status"
            >
                <span className="visually-hidden">
                    {loadingText}
                </span>
            </div>

            <span className="ms-3">
                {loadingText}
            </span>
        </div>
    );
};

export default Loading;
