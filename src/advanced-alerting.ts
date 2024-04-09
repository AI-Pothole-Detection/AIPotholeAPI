import { ALERT_THRESHOLD_METERS } from './constants';
import { getClosestPothole } from './rpcs';

export async function shouldAlert(lat: number, long: number): Promise<boolean> {
    const closest = await getClosestPothole(lat, long);
    if (closest === undefined || closest === null) {
        return false;
    }
    return closest.distance <= ALERT_THRESHOLD_METERS;
}
