import { CLOSENESS_THRESHOLD_METERS } from './constants';
import type { Pothole } from './internal.types';
import { createNewPothole, getPotholeById } from './resource-operations';
import { getClosestPothole, incrementPothole } from './rpcs';
import { supabase } from './supabase';

interface IncrementOutcome {
    outcome: 'increment';
    pothole: Pothole;
}

interface CreateOutcome {
    outcome: 'creation';
    pothole: Pothole;
}

interface ErrorOutcome {
    outcome: 'error';
}

type ReportOutcome = IncrementOutcome | CreateOutcome | ErrorOutcome;

export async function reportPothole(
    lat: number,
    long: number
): Promise<ReportOutcome> {
    const closestPothole = await getClosestPothole(lat, long);

    if (closestPothole === undefined) {
        return {
            outcome: 'error',
        };
    } else if (
        closestPothole === null ||
        closestPothole.distance > CLOSENESS_THRESHOLD_METERS
    ) {
        const pothole = await createNewPothole(lat, long);
        if (pothole === undefined) {
            return {
                outcome: 'error',
            };
        } else {
            return {
                outcome: 'creation',
                pothole,
            };
        }
    } else {
        const id = closestPothole.id;
        const pothole = await closestInfoHelper(id, lat, long);
        if ((await incrementPothole(id)) === null || pothole === undefined) {
            return {
                outcome: 'error',
            };
        } else {
            return {
                outcome: 'increment',
                pothole,
            };
        }
    }
}

// im getting lazy sorry everyone
async function closestInfoHelper(
    id: number,
    lat: number,
    long: number
): Promise<Pothole | undefined> {
    const { data, error } = await supabase
        .from('potholes')
        .select(
            'id,createdAt:created_at,lastReportedAt:last_reported_at,expiresAt:expires_at,reports'
        )
        .eq('id', id);

    if (error || data.length === 0) {
        return undefined;
    }

    return { lat, long, ...data[0] };
}
