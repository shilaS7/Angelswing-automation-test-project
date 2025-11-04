export const STATUS_CODES = {
    SUCCESS: {
        CREATED: 201,
        OK: 200,
        ACCEPTED: 202,
        DELETED: 203,
    },
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        UNPROCESSABLE_ENTITY: 422
    },
    SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    }
};
