import api from "./api";

export const uploadCv = async (file: File): Promise<string> => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post<string>(
        "/cv/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const getMyCv = async (): Promise<Blob> => {
    const userId = localStorage.getItem("token");

    if (!userId) {
        throw new Error("User ID not found.");
    }

    const response = await api.get(
        `/cv/me`,
        {
            responseType: "blob",
        }
    );

    return response.data;
};

export const getCandidateCv = async (candidateId: number): Promise<Blob> => {
    const response = await api.get(
        `/cv/candidate/${candidateId}`,
        {
            responseType: "blob",
        }
    );

    return response.data;
};

export const getApplicationCv = async (applicationId: number): Promise<Blob> => {
    const response = await api.get(
        `/cv/applications/${applicationId}`,
        {
            responseType: "blob",
        }
    );

    return response.data;
};

