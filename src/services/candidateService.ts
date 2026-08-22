import api from "./api";

import type {
    CandidateDetails,
    CandidateProfile,
} from "../types/candidate";


// =====================================================
// GET MY PROFILE
// =====================================================

export const getMyCandidateProfile =
    async (): Promise<CandidateProfile> => {

        const response =
            await api.get<CandidateProfile>(
                "/candidate/profile"
            );

        return response.data;
    };


// =====================================================
// GET CANDIDATE BY ID
// =====================================================

export const getCandidateById =
    async (
        candidateId: number
    ): Promise<CandidateDetails> => {

        const response =
            await api.get<CandidateDetails>(
                `/candidate/${candidateId}`
            );

        return response.data;
    };