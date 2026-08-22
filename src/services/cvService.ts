import api from "./api";


// =====================================================
// GET CANDIDATE CV
// =====================================================

export const getCandidateCv = async (
    candidateId: number
): Promise<Blob> => {

    const response = await api.get(
        `/cv/candidate/${candidateId}`,
        {
            responseType: "blob",
        }
    );

    return response.data;
};


// =====================================================
// OPEN CANDIDATE CV
// =====================================================

export const openCandidateCv = async (
    candidateId: number
): Promise<void> => {

    const blob = await getCandidateCv(candidateId);

    const url = window.URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 1000);
};