import express from 'express';

import {
    createIncrementSuccess,
    createInvalidActionFormatError,
    createMissingBodyElementError,
    createPotholeCreationSuccess,
    createSupabaseError,
    createUnsupportedActionError,
    notImplementedResponse,
} from './responses';
import { supabase } from './supabase';
import { CLOSENESS_THRESHOLD_METERS } from './constants';

const app = express();
const port = 3000;

// This a JSON API fr fr no cap on a stack
app.use(express.json());

interface ReportBody {
    // i love typescript, but having absolutely 0 type safety when
    // interacting with over-the-wire JSON input is really,
    // really really annoying. Rust rewrite when ?? 🦀👀
    longitude: any;
    latitude: any;
}

// Endpoint for reporting a pothole
// Critically, this may or may not create a new Pothole resource
// hence it being not very RESTful in its name
app.post('/potholes:action', async (req, res) => {
    const action = req.params.action;
    if (action !== ':report') {
        if (action[0] !== ':') {
            const { status, body } = createInvalidActionFormatError();
            res.status(status);
            res.send(body);
        }

        const { status, body } = createUnsupportedActionError(
            action.replace(':', '')
        );
        res.status(status);
        res.send(body);
        return;
    }

    const reqBody: ReportBody = req.body;

    const { longitude: rawLongitude, latitude: rawLatitude } = reqBody;

    // Now we gotta manually verify the types like goddamn cave men
    const longitude = Number(rawLongitude);
    const latitude = Number(rawLatitude);

    if (Number.isNaN(longitude)) {
        const { status, body } = createMissingBodyElementError('longitude');
        res.status(status);
        res.send(body);
        return;
    }

    if (Number.isNaN(latitude)) {
        const { status, body } = createMissingBodyElementError('latitude');
        res.status(status);
        res.send(body);
        return;
    }

    const closest = await getClosestPothole(latitude, longitude);

    if (closest === undefined) {
        const { status, body } = createSupabaseError();
        res.status(status);
        res.send(body);
        return;
    }

    // Now that we have our closest pothole, we check if it is within 150 meters
    // If it is, we will simply increment the number of reports on that location,
    // and then end the request
    if (closest.distance <= CLOSENESS_THRESHOLD_METERS) {
        const incrementResult = await incrementPothole(closest.id);
        if (incrementResult === null) {
            const { status, body } = createSupabaseError();
            res.status(status);
            res.send(body);
            return;
        }
        const { status, body } = createIncrementSuccess(closest.id);
        res.status(status);
        res.send(body);
        return;
    }

    // If we made it here, we need to go ahead and create a new pothole resource
    // since one within the threshold does not exist
    const potholeId = await createNewPothole(longitude, latitude);

    if (potholeId === null) {
        const { status, body } = createSupabaseError();
        res.status(status);
        res.send(body);
        return;
    }

    const { status, body } = createPotholeCreationSuccess(potholeId);
    res.status(status);
    res.send(body);
    return;
});

async function createNewPothole(
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

async function incrementPothole(id: number): Promise<void | null> {
    const { data, error } = await supabase.rpc('increment', {
        id_to_increment: id,
    });

    if (error) {
        return null;
    }
}

async function getClosestPothole(lat: number, long: number) {
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

app.listen(port, () => {
    console.log(`AI Pothole API listening on port ${port}`);
});
