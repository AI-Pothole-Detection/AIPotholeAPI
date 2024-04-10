/**
 * Putting all the response codes here because I am a lazy bastard.
 *
 * CODES:
 *  1 - Resource creation success
 *  2 - Resource creation failure, our fault
 *
 *  3 - Provided Base64 could not be parsed, user's fault
 *  4 - Invalid URL Parameter
 *
 *  5 - Resource could not be retrieved due to internal error
 *  6 - Resource does not exist
 *  7 - Resource was successfully retrieved
 *
 *  8 - Set of resources was successfully retrieved
 *  9 - Resource could not be deleted
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

// DONE
export function createSuccessResourceCreated(image: Image): ResponseInfo {
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

// DONE
export function createErrorResourceCreation(): ResponseInfo {
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

// DONE
export function createErrorUnparsableBase64(): ResponseInfo {
    return {
        status: 400,
        body: {
            type: 'Error',
            code: 3,
            message:
                'The provided base64 could not be parsed. Please review base64 payload and try again.',
        },
    };
}

// DONE
export function createErrorInvalidURLParameter(
    parameter: string
): ResponseInfo {
    return {
        status: 400,
        body: {
            type: 'Error',
            code: 4,
            message: `An invalid value was given for the '${parameter}' URL parameter. Please review the value and try again.`,
        },
    };
}

// DONE
export function createErrorResourceRetrevial(): ResponseInfo {
    return {
        status: 500,
        body: {
            type: 'Error',
            code: 5,
            message:
                'An internal error occurred while trying to retrieve the specified resource.',
        },
    };
}

// DONE
export function createErrorResourceNonexistant(): ResponseInfo {
    return {
        status: 404,
        body: {
            type: 'Error',
            code: 6,
            message: 'No resource matching the given parameters exists.',
        },
    };
}

// DONE
export function createSuccessRetrevial(data: any): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'Success',
            code: 7,
            message: 'The specified resource was successfully retrieved.',
            data,
        },
    };
}

// DONE
export function createSuccessResourcesRetrieved(data: any): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'Success',
            code: 8,
            message:
                'One or more resources were found matching the given parameters.',
            data,
        },
    };
}

export function createErrorResourceDeletion(): ResponseInfo {
    return {
        status: 500,
        body: {
            type: 'Error',
            code: 9,
            message:
                'The specified resource could not be deleted due to an internal error.',
        },
    };
}

export function createSuccessResourceDeletion(): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'Success',
            code: 10,
            message: 'The specified resource was successfully deleted.',
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
