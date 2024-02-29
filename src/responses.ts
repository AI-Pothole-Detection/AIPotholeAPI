/**
 * Putting all the response codes here because I am a lazy bastard.
 *
 * code 0 : Not implemented
 * code 1 : Missing parameter
 * code 2 : Successfully created new pothole from report
 * code 3 : Successfully incremented pothole report count from report
 */

interface ResponseInfo {
    status: number;
    body: ResponseBody;
}

type ResponseBody = ErrorResponseBody | SuccessResponseBody;

interface ErrorResponseBody {
    type: 'error';
    error: {
        code: number;
        message: string;
    };
}

interface SuccessResponseBody {
    type: 'success';
    data: {
        code: number;
        message: string;
        data?: any;
    };
}

export function createPotholeCreationSuccess(id: number): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'success',
            data: {
                code: 2,
                message: `Successfully created pothole with id ${id}.`,
            },
        },
    };
}

export function createIncrementSuccess(id: number): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'success',
            data: {
                code: 3,
                message: `Successfully incremented pothole with id ${id}.`,
            },
        },
    };
}

export function createSupabaseError(): ResponseInfo {
    return {
        status: 500,
        body: {
            type: 'error',
            error: {
                code: 2,
                message: "Something went wrong on Supabase's end.",
            },
        },
    };
}

export function createMissingBodyElementError(
    missingParameter: string
): ResponseInfo {
    return {
        status: 422,
        body: {
            type: 'error',
            error: {
                code: 1,
                message: `Missing parameter '${missingParameter}'.`,
            },
        },
    };
}

export const notImplementedResponse = {
    type: 'error',
    error: {
        code: 0,
        message: 'Not implemented.',
    },
};
