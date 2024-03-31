import { GOOGLE_API_KEY } from './constants';

export interface GoogleAPIResponse {
    plus_code: PlusCode;
    results: Result[];
    status: string;
}

export interface PlusCode {
    compound_code: string;
    global_code: string;
}

export interface Result {
    address_components: AddressComponent[];
    formatted_address: string;
    geometry: Geometry;
    place_id: string;
    plus_code?: PlusCode;
    types: string[];
    postcode_localities?: string[];
}

export interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

export interface Geometry {
    location: Location;
    location_type: string;
    viewport: Bounds;
    bounds?: Bounds;
}

export interface Bounds {
    northeast: Location;
    southwest: Location;
}

export interface Location {
    lat: number;
    lng: number;
}

export async function getLocation(lat: number, long: number) {
    const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${GOOGLE_API_KEY}`
    );
    const d = (await res.json()) as GoogleAPIResponse;

    const street = d.results[0].address_components[1].long_name;
    const city = d.results[0].address_components[2].long_name;
    const county = d.results[0].address_components[3].long_name;

    return {
        street,
        city,
        county,
    };
}
