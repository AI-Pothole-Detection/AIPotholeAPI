import { supabase } from './supabase';

export async function incrementPothole(id: number): Promise<void | null> {
    const { data, error } = await supabase.rpc('increment', {
        id_to_increment: id,
    });

    if (error) {
        return null;
    }
}

/**
 * A function wrapping the `nearby_potholes` PostgreSQL RPC in our database,
 * used to find the closest pothole to a given point.
 *
 * @param lat - the latitude of the location
 * @param long - the longitude of the location
 * @returns several different types depending on outcome:
 *
 * ## Unsuccessful Responses
 *  - `undefined` if an error occured with the PostgreSQL RPC and/or Supabase
 *  - `null` if there is not a closest pothole to this point.
 *
 * ## Successful Responses
 *  if successful, a object is returned with `id` and `distance` properties
 *  representing the database id for the pothole and the distance it is from
 *  the given point
 */
export async function getClosestPothole(lat: number, long: number) {
    const { data, error } = await supabase.rpc('nearby_potholes', {
        lat,
        long,
    });

    if (error) {
        return undefined;
    }

    if (data.length === 0) {
        return null;
    }

    const { id, dist_meters } = data[0];
    return {
        id,
        distance: dist_meters,
    };
}
