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
 *  10 - Successful resource deletion
 *  11 - Unsupported action
 *  12 - Invalid JSON element
 *  13 - Successful alert response
 *  14 - Resource modification success
 *  15 - Resource modification failure
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
export function createSuccessResourceCreated(data: any): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'Success',
            code: 1,
            message: `The resource was successfully created`,
            data,
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

export function createErrorUnsupportedAction(): ResponseInfo {
    return {
        status: 404,
        body: {
            type: 'Error',
            code: 11,
            message: `Unsupported action. Supported actions are ':report' and ':alert'.`,
        },
    };
}

export function createErrorInvalidJSONElement(
    invalidElement: string
): ResponseInfo {
    return {
        status: 400,
        body: {
            type: 'Error',
            code: 12,
            message: `Invalid JSON element '${invalidElement}' in request body`,
        },
    };
}

export function createSuccessAlert(alert: boolean): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'Success',
            code: 13,
            message: 'Successfully checked for nearby potholes.',
            data: {
                alert,
            },
        },
    };
}

export function createSuccessResourceModified(data: any): ResponseInfo {
    return {
        status: 200,
        body: {
            type: 'Success',
            code: 14,
            message: 'The specified resource was modified as requested.',
            data,
        },
    };
}

export function createErrorResourceModification(): ResponseInfo {
    return {
        status: 500,
        body: {
            type: 'Error',
            code: 15,
            message:
                'The specified resource was not modified due to an internal error.',
        },
    };
}
