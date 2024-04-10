interface LatLongConversionResults {
    lat: number | null;
    long: number | null;
}

export function verifyLatLong(lat: any, long: any): LatLongConversionResults {
    return {
        lat: isNumber(lat) ? lat : null,
        long: isNumber(long) ? long : null,
    };
}

type Base64VerificationResults = string | null;

export function verifyBase64(base64: string): Base64VerificationResults {
    // TODO: Potentially more robust base64 verification?
    return new RegExp(
        '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$'
    ).test(base64)
        ? base64
        : null;
}

export function deduceAction(action: string) {
    if (action === ':alert') {
        return 'alert';
    } else if (action === ':report') {
        return 'report';
    } else {
        return undefined;
    }
}

function isNumber(v: any) {
    return typeof v === 'number';
}

function isString(v: any) {
    return typeof v === 'string';
}
