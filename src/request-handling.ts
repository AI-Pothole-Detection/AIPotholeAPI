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
