import { supabase } from "./supabase";

export async function createNewPothole(
    long: number,
    lat: number
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

export async function incrementPothole(id: number): Promise<void | null> {
    const { data, error } = await supabase.rpc('increment', {
        id_to_increment: id,
    });

    if (error) {
        return null;
    }
}

export async function getClosestPothole(lat: number, long: number) {
    const { data, error } = await supabase.rpc('nearby_potholes', {
        lat,
        long,
    });

    if (error) {
        return undefined;
    }

    const { id, dist_meters } = data[0];
    return {
        id,
        distance: dist_meters,
    };
}