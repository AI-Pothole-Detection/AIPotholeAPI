/**
 * Putting all the response codes here because I am a lazy bastard.
 *
 * CODES:
 *  1 - Resource creation success
 *  2 - Resource creation failure due to internal error
 */

import type { Image, Pothole } from './internal.types';

interface ResponseInfo {
    status: number;
    body: ResponseBody;
}

interface ErrorBody {
    type: 'Error';
    code: number;
    message: string;
}

interface SuccessBody {
    type: 'Success';
    code: number;
    message: string;
    data?: any;
}

type ResponseBody = ErrorBody | SuccessBody;

export function createResourceCreationSuccess(image: Image): ResponseInfo {
    const { id } = image;
    return {
        status: 200,
        body: {
            type: 'Success',
            code: 1,
            message: `The image was successfully created with id ${id}.`,
            data: image,
        },
    };
}

export function createResourceCreationFailureInternal(): ResponseInfo {
    return {
        status: 500,
        body: {
            type: 'Error',
            code: 2,
            message:
                'The specified resource was not created due to an internal error.',
        },
    };
}

export function createInvalidBase64Error(): ResponseInfo {
    return {
        status: 400,
        body: {
            type: 'error',
            error: {
                code: 11,
                message: 'Invalid base64 image encoding.',
            },
        },
    };
}

export function createInvalidIDParameter(): ResponseInfo {
    return {
        status: 400,
        body: {
            type: 'error',
            error: {
                code: 10,
                message: "Invalid parameter 'id'.",
            },
        },
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
