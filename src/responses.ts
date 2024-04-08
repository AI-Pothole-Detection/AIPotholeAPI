/**
 * Putting all the response codes here because I am a lazy bastard.
 *
 * code 0 : Not implemented error
 * code 1 : Missing parameter error
 * code 2 : Successfully created new pothole from report
 * code 3 : Successfully incremented pothole report count from report
 * code 4 : Given action is unsupported error
 * code 5 : Successfully said if an alert should appear
 * code 6 : Successfully retreived potholes
 * code 7 : Invalid query parameters error
 * code 8 : Could not delete specified resource
 * code 9 : Invalid JSON Body element
 */

import type { Pothole } from './internal.types';

/**
 * ResponseInfo
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
        result?: any;
    };
}

export function createInvalidJSONBodyElement(
    invalidElement: string
): ResponseInfo {
    return {
        status: 400,
        body: {
            type: 'error',
            error: {
                code: 9,
                message: `Invalid JSON element '${invalidElement}' in request body`,
            },
        },
    };
}

export function createPotholeGetSuccess(potholes: Pothole[]): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'success',
            data: {
                code: 6,
                message: 'Successfully retrieved potholes.',
                result: potholes,
            },
        },
    };
}

export function createResourceDeletionError(): ResponseInfo {
    return {
        status: 405,
        body: {
            type: 'error',
            error: {
                code: 7,
                message: 'The requested resource could not be deleted.',
            },
        },
    };
}

export function createResourceDeletionSuccess(): ResponseInfo {
    return {
        status: 405,
        body: {
            type: 'success',
            data: {
                code: 8,
                message: 'The specified resource was successfully deleted.',
            },
        },
    };
}

export function createInvalidQueryParametersError(): ResponseInfo {
    return {
        status: 400,
        body: {
            type: 'error',
            error: {
                code: 7,
                message: 'Could not parse query parameters.',
            },
        },
    };
}

export function createInvalidActionFormatError(): ResponseInfo {
    return {
        status: 422,
        body: {
            type: 'error',
            error: {
                code: 5,
                message:
                    "Invalid action format. Actions must follow the format '.../...:<action>'.",
            },
        },
    };
}

export function createUnsupportedActionError(): ResponseInfo {
    return {
        status: 404,
        body: {
            type: 'error',
            error: {
                code: 4,
                message: `Unsupported action. Supported actions are ':report' and ':alert'.`,
            },
        },
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

export function createAlertSuccess(alert: boolean): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'success',
            data: {
                code: 5,
                message: 'Successfully checked for nearby potholes.',
                result: {
                    alert,
                },
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
