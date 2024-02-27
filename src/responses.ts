/**
 * Putting all the response codes here because I am a lazy bastard.
 *
 * code 0 : Not implemented
 * code 1 : Missing parameter
 */

interface ResponseInfo {
    status: number;
    body: ResponseBody;
}

type ResponseBody = ErrorResponseBody;

interface ErrorResponseBody {
    type: 'error';
    error: {
        code: number;
        message: string;
    };
}

export function createMissingBodyElement(
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
