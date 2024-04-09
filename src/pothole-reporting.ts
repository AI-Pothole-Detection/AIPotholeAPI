import { CLOSENESS_THRESHOLD_METERS } from './constants';
import { createNewPothole } from './resource-operations';
import { getClosestPothole, incrementPothole } from './rpcs';

interface IncrementOutcome {
    outcome: 'increment';
    id: number;
}

interface CreateOutcome {
    outcome: 'creation';
    id: number;
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
        const id = await createNewPothole(lat, long);
        if (id === null) {
            return {
                outcome: 'error',
            };
        } else {
            return {
                outcome: 'creation',
                id,
            };
        }
    } else {
        const id = closestPothole.id;
        if ((await incrementPothole(id)) === null) {
            return {
                outcome: 'error',
            };
        } else {
            return {
                outcome: 'increment',
                id,
            };
        }
    }
}
