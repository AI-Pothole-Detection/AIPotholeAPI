import express from 'express';

import cors from 'cors';

import {
    createAlertSuccess,
    createFailedImageCreationError,
    createImageSuccess,
    createIncrementSuccess,
    createInvalidBase64Error,
    createInvalidIDParameter,
    createInvalidJSONBodyElement,
    createInvalidQueryParametersError,
    createPotholeCreationSuccess,
    createPotholeGetSuccess,
    createResourceDeletionError,
    createResourceDeletionSuccess,
    createSupabaseError,
    createUnsupportedActionError,
} from './responses';
import { shouldAlert } from './advanced-alerting';
import { supabase } from './supabase';
import { deduceAction, verifyBase64, verifyLatLong } from './request-handling';
import { reportPothole } from './pothole-reporting';
import {
    createNewImageResource,
    getImageResource,
} from './resource-operations';

const app = express();
const port = 3000;

// This a JSON API fr fr no cap on a stack
app.use(express.json({ limit: '500mb' }));
app.use(cors());

interface ActionBody {
    // i love typescript, but having absolutely 0 type safety when
    // interacting with over-the-wire JSON input is really,
    // really really annoying. Rust rewrite when ?? 🦀👀
    longitude: any;
    latitude: any;
}

// Endpoint for our weirder endpoints.
// Naming is based of API Design Patterns, it's there
// to signify that these are not normal RESTful endpoints,
// but have side effects.
//
// Supported actions right now are `:report` and `:alert`
app.post('/potholes:action', async (req, res) => {
    const { latitude: unverifiedLat, longitude: unverifiedLong } = req.body;

    const { lat, long } = verifyLatLong(unverifiedLat, unverifiedLong);

    if (lat === null) {
        const { status, body } = createInvalidJSONBodyElement('latitude');
        res.status(status).send(body);
        return;
    }

    if (long === null) {
        const { status, body } = createInvalidJSONBodyElement('longitude');
        res.status(status).send(body);
        return;
    }

    const rawAction = req.params.action;
    const action = deduceAction(rawAction);

    if (action === undefined) {
        const { status, body } = createUnsupportedActionError();
        res.status(status).send(body);
        return;
    }

    if (action === 'alert') {
        const alert = await shouldAlert(lat, long);
        const { body, status } = createAlertSuccess(alert);
        res.status(status).send(body);
        return;
    }

    const reportOutcome = await reportPothole(lat, long);
    switch (reportOutcome.outcome) {
        case 'creation': {
            const { status, body } = createPotholeCreationSuccess(
                reportOutcome.id
            );
            res.status(status).send(body);
            return;
        }
        case 'increment': {
            const { status, body } = createIncrementSuccess(reportOutcome.id);
            res.status(status).send(body);
            return;
        }
        case 'error': {
            const { status, body } = createSupabaseError();
            res.status(status).send(body);
            return;
        }
    }
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

app.post('/images', async (req, res) => {
    console.log('HELLO!');
    const potholeId = Number(req.query.pothole);

    if (Number.isNaN(potholeId)) {
        // TODO: should be invalid query
        const { status, body } = createInvalidIDParameter();
        res.status(status).send(body);
        return;
    }

    const { encoding: rawEncoding } = req.body;
    const encoding = verifyBase64(rawEncoding);

    if (encoding === null) {
        const { status, body } = createInvalidBase64Error();
        res.status(status).send(body);
        return;
    }

    const result = await createNewImageResource(potholeId, encoding);
    switch (result.outcome) {
        case 'creation error': {
            const { status, body } = createFailedImageCreationError();
            res.status(status).send(body);
            return;
        }
        case 'upload error': {
            const { status, body } = createFailedImageCreationError();
            res.status(status).send(body);
            return;
        }
        case 'creation success': {
            const { status, body } = createImageSuccess(result.id);
            res.status(status).send(body);
            return;
        }
    }
});

app.get(`/images/:id`, async (req, res) => {
    //
    // This endpoint is for retreiving a image resource
    // via the id of the image resource itself.
    //
    // This is the sister endpoint of /images,
    // which supports retreiving all images by
    // associated pothole id
    //

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        res.status(400).send('error with the id param');
        return;
    }

    const imageUrl = getImageResource(id);
    res.status(200).send(imageUrl);
    return;
});

app.get(`/images`, async (req, res) => {
    //
    // We want this endpoint to handle searching for images
    // via pothole id
    //
    // This is the more useful of image endpoints,
    // since searching by image id requires knowing the image id
    // beforehand
    //

    const { potholeId } = req.query;

    if (potholeId === undefined) {
        return;
    }

    const { data, error } = await supabase
        .from('images')
        .select('id,createdAt:created_at')
        .eq('pothole_id', potholeId)
        .order('created_at', { ascending: false });

    if (error) {
        res.status(500).send('supabase error');
        return;
    }

    interface Image {
        id: number;
        createdAt: string;
        url: string;
    }

    let images = [];
    for (const element of data) {
        images.push({
            ...element,
            url: getImageResource(element.id),
        });
    }

    res.send(images);
    return;
});

app.listen(port, () => {
    console.log(`AI Pothole API listening on port ${port}`);
});
