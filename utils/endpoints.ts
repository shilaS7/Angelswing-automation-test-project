const API_URL = process.env.API_URL || `${process.env.API_URL}`;

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_URL}/auth/signin`,
        RESET_PASSWORD: `${API_URL}/users/password`,
    }
};
