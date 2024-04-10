import type { Image } from './internal.types';
import { createPotholeCreationSuccess } from './responses';
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
    image: Image;
}

type NewImageOutcome = CreationError | UploadError | CreationSuccess;

// TODO: potentially rename? "new" is redundant when talking about creation
export async function createNewImageResource(
    potholeId: number,
    encoding: string
): Promise<NewImageOutcome> {
    const { data, error } = await supabase
        .from('images')
        .insert({
            pothole_id: potholeId,
        })
        .select('id,createdAt:created_at');

    if (error) {
        return {
            outcome: 'creation error',
        };
    }

    const { id, createdAt } = data[0];

    const path = await uploadImage(id, encoding);

    if (path === undefined) {
        return {
            outcome: 'upload error',
        };
    }

    return {
        outcome: 'creation success',
        image: {
            id,
            potholeId,
            createdAt,
            url: getImageUrl(id),
        },
    };
}

export function getImageUrl(id: number) {
    const {
        data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(`${id}.png`);
    return publicUrl;
}

export async function getImageResourceById(
    id: number
): Promise<Image | null | undefined> {
    const { data, error } = await supabase
        .from('images')
        .select('id,createdAt:created_at,potholeId:pothole_id')
        .eq('id', id);

    if (error) {
        return undefined;
    }

    if (data.length === 0) {
        return null;
    }

    const { createdAt, potholeId } = data[0];
    return {
        id,
        createdAt,
        potholeId,
        url: getImageUrl(id),
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
