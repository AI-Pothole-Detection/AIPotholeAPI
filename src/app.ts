import express, { raw } from 'express';

import cors from 'cors';

import {
    createAlertSuccess,
    createIncrementSuccess,
    createInvalidActionFormatError,
    createInvalidQueryParametersError,
    createMissingBodyElementError,
    createPotholeCreationSuccess,
    createPotholeGetSuccess,
    createResourceDeletionError,
    createResourceDeletionSuccess,
    createSupabaseError,
    createUnsupportedActionError,
} from './responses';
import { CLOSENESS_THRESHOLD_METERS } from './constants';
import { getClosestPothole, incrementPothole } from './rpcs';
import { shouldAlert } from './advanced-alerting';
import { supabase } from './supabase';
import { createNewPothole } from './resource-operations';

const app = express();
const port = 3000;

// This a JSON API fr fr no cap on a stack
app.use(express.json(), cors());

interface ReportBody {
    // i love typescript, but having absolutely 0 type safety when
    // interacting with over-the-wire JSON input is really,
    // really really annoying. Rust rewrite when ?? 🦀👀
    longitude: any;
    latitude: any;
}

// Endpoint for reporting/alerting to a pothole
// Critically, this may or may not create a new Pothole resource
// hence it being not very RESTful in its name
app.post('/potholes:action', async (req, res) => {
    const action = req.params.action;
    if (action !== ':report' && action !== ':alert') {
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

    if (action === ':alert') {
        const alert = await shouldAlert(longitude, latitude);
        const { status, body } = createAlertSuccess(alert);
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
    if (closest !== null && closest.distance <= CLOSENESS_THRESHOLD_METERS) {
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

app.delete('/potholes', async (req, res) => {
    const { id: rawId } = req.query;
    const id = Number(rawId);

    if (Number.isNaN(id)) {
        const { status, body } = createInvalidQueryParametersError();
        res.status(status).send(body);
        return;
    }

    const { data, error: existenceError } = await supabase
        .from('potholes')
        .select('id')
        .eq('id', id);
    const { error } = await supabase.from('potholes').delete().eq('id', id);

    if (error || existenceError || data.length === 0) {
        const { status, body } = createResourceDeletionError();
        res.status(status).send(body);
        return;
    }

    const { status, body } = createResourceDeletionSuccess();
    res.status(status).send(body);
    return;
});

app.get('/potholes', async (req, res) => {
    const {
        minLat: rawMinLat,
        minLong: rawMinLong,
        maxLat: rawMaxLat,
        maxLong: rawMaxLong,
    } = req.query;

    // Verifying type as number for each
    // using snake_case since the RPC uses it
    const minLat = Number(rawMinLat);
    const minLong = Number(rawMinLong);
    const maxLat = Number(rawMaxLat);
    const maxLong = Number(rawMaxLong);

    if (
        Number.isNaN(minLat) ||
        Number.isNaN(minLong) ||
        Number.isNaN(maxLat) ||
        Number.isNaN(maxLong)
    ) {
        const { status, body } = createInvalidQueryParametersError();
        res.status(status);
        res.send(body);
        return;
    }

    const { data, error } = await supabase.rpc('potholes_in_view', {
        min_lat: Number(minLat),
        min_long: Number(minLong),
        max_lat: Number(maxLat),
        max_long: Number(maxLong),
    });

    if (error) {
        const { status, body } = createSupabaseError();
        res.status(status);
        res.send(body);
        return;
    }

    const { status, body } = createPotholeGetSuccess(data || []);
    res.status(status);
    res.send(body);
    return;
});

app.listen(port, () => {
    console.log(`AI Pothole API listening on port ${port}`);
});
