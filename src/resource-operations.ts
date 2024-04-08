import { supabase } from './supabase';

/**
 * A function that creates a new pothole in our database.
 * Please do not use prior to checking if a pothole is within
 * the given delta radius, as this should only be used
 * when we are documenting a novel pothole report.
 *
 * @param lat - the longitude of the pothole
 * @param long  - the latitude of the pothole
 * @returns null if unsuccessful and a number if successful
 */
export async function createNewPothole(
    lat: number,
    long: number
): Promise<number | null> {
    const { data, error } = await supabase
        .from('potholes')
        .insert({ location: `POINT(${long} ${lat})` })
        .select('id');

    if (error) {
        return null;
    }

    return data[0].id;
}
