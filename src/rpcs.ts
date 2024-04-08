import { supabase } from './supabase';

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

    if (data.length === 0) {
        return null;
    }

    const { id, dist_meters } = data[0];
    return {
        id,
        distance: dist_meters,
    };
}
