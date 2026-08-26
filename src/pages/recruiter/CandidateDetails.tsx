import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

function CandidateDetails() {
    const { t } = useLanguage();

    return (
        <div className="container py-5">
            <h2>{t("recruiter.candidateProfile")}</h2>
            <p className="text-muted">{t("recruiter.candidateProfileDescription")}</p>
        </div>
    );

}
export default CandidateDetails;
