import { supabase } from './supabase';

import { decode } from 'base64-arraybuffer';

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

interface CreationError {
    outcome: 'creation error';
}

interface UploadError {
    outcome: 'upload error';
}

interface CreationSuccess {
    outcome: 'creation success';
    id: number;
}

type NewImageOutcome = CreationError | UploadError | CreationSuccess;

export async function createNewImageResource(
    potholeId: number,
    encoding: string
): Promise<NewImageOutcome> {
    const { data, error } = await supabase
        .from('images')
        .insert({
            pothole_id: potholeId,
        })
        .select('id');

    if (error) {
        return {
            outcome: 'creation error',
        };
    }

    const id = data[0].id;

    const path = await uploadImage(id, encoding);

    if (path === undefined) {
        return {
            outcome: 'upload error',
        };
    }

    return {
        outcome: 'creation success',
        id,
    };
}

async function uploadImage(id: number, encoding: string) {
    const { data, error } = await supabase.storage
        .from('images')
        .upload(`${id}.png`, decode(encoding), {
            contentType: 'image/png',
        });

    if (error) {
        return undefined;
    }

    return data.path;
}
