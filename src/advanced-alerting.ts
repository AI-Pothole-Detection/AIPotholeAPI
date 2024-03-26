import { ALERT_THRESHOLD_METERS } from "./constants";
import { getClosestPothole } from "./rpcs";

export async function shouldAlert(long: number, lat: number): Promise<boolean> {
    const closest = await getClosestPothole(lat, long);
    if (closest === undefined) {
        return false;
    }
    return closest.distance <= ALERT_THRESHOLD_METERS;
}