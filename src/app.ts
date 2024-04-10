import express from 'express';

import cors from 'cors';

import {
    createSuccessAlert,
    createErrorResourceCreation,
    createSuccessResourceCreated,
    createErrorUnparsableBase64,
    createErrorInvalidJSONElement,
    createErrorUnsupportedAction,
    createErrorInvalidURLParameter,
    createErrorResourceRetrevial,
    createErrorResourceNonexistant,
    createSuccessRetrevial,
    createSuccessResourcesRetrieved,
    createErrorResourceDeletion,
    createSuccessResourceDeletion,
    createSuccessResourceModified,
    createErrorResourceModification,
} from './responses';
import { shouldAlert } from './advanced-alerting';
import { supabase } from './supabase';
import { deduceAction, verifyBase64, verifyLatLong } from './request-handling';
import { reportPothole } from './pothole-reporting';
import {
    createNewImageResource,
    getImageResourceById,
    getImageUrl,
} from './resource-operations';
import type { Image } from './internal.types';

const app = express();
const port = 3000;

app.use(express.json({ limit: '500mb' }));
app.use(cors());

app.post('/potholes:action', async (req, res) => {
    const { latitude: unverifiedLat, longitude: unverifiedLong } = req.body;

    const { lat, long } = verifyLatLong(unverifiedLat, unverifiedLong);

    if (lat === null) {
        const { status, body } = createErrorInvalidJSONElement('latitude');
        res.status(status).send(body);
        return;
    }

    if (long === null) {
        const { status, body } = createErrorInvalidJSONElement('longitude');
        res.status(status).send(body);
        return;
    }

    const rawAction = req.params.action;
    const action = deduceAction(rawAction);

    if (action === undefined) {
        const { status, body } = createErrorUnsupportedAction();
        res.status(status).send(body);
        return;
    }

    if (action === 'alert') {
        const alert = await shouldAlert(lat, long);
        const { body, status } = createSuccessAlert(alert);
        res.status(status).send(body);
        return;
    }

    const reportOutcome = await reportPothole(lat, long);
    switch (reportOutcome.outcome) {
        case 'creation': {
            const { status, body } = createSuccessResourceCreated(
                reportOutcome.pothole
            );
            res.status(status).send(body);
            return;
        }
        case 'increment': {
            const { status, body } = createSuccessResourceModified(
                reportOutcome.pothole
            );
            res.status(status).send(body);
            return;
        }
        case 'error': {
            const { status, body } = createErrorResourceModification();
            res.status(status).send(body);
            return;
        }
    }
});

app.delete('/potholes/:id', async (req, res) => {
    const { id: rawId } = req.params;
    const id = Number(rawId);

    if (Number.isNaN(id)) {
        const { status, body } = createErrorInvalidURLParameter('id');
        res.status(status).send(body);
        return;
    }

    const { data, error: existenceError } = await supabase
        .from('potholes')
        .select('id')
        .eq('id', id);

    if (existenceError) {
        const { status, body } = createErrorResourceDeletion();
        res.status(status).send(body);
        return;
    }

    if (data.length === 0) {
        const { status, body } = createErrorResourceNonexistant();
        res.status(status).send(body);
        return;
    }

    const { error } = await supabase.from('potholes').delete().eq('id', id);

    if (error) {
        const { status, body } = createErrorResourceDeletion();
        res.status(status).send(body);
        return;
    }

    const { status, body } = createSuccessResourceDeletion();
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

    if (Number.isNaN(minLat)) {
        const { status, body } = createErrorInvalidURLParameter('minLat');
        res.status(status).send(body);
        return;
    }
    if (Number.isNaN(minLong)) {
        const { status, body } = createErrorInvalidURLParameter('minLong');
        res.status(status).send(body);
        return;
    }
    if (Number.isNaN(maxLat)) {
        const { status, body } = createErrorInvalidURLParameter('maxLat');
        res.status(status).send(body);
        return;
    }
    if (Number.isNaN(maxLong)) {
        const { status, body } = createErrorInvalidURLParameter('maxLong');
        res.status(status).send(body);
        return;
    }

    const { data, error } = await supabase.rpc('potholes_in_view', {
        min_lat: minLat,
        min_long: minLong,
        max_lat: maxLat,
        max_long: maxLong,
    });

    if (error) {
        const { status, body } = createErrorResourceRetrevial();
        res.status(status).send(body);
        return;
    }

    if (data.length === 0) {
        const { status, body } = createErrorResourceNonexistant();
        res.status(status).send(body);
        return;
    }

    const { status, body } = createSuccessResourcesRetrieved(data);
    res.status(status).send(body);
    return;
});

app.post('/images', async (req, res) => {
    const potholeId = Number(req.query.pothole);

    // Really simple check that we aren't dealing with a NaN
    // this is acting as validation
    // TODO: more rigorous validation check?
    if (Number.isNaN(potholeId)) {
        const { status, body } = createErrorInvalidURLParameter('potholeId');
        res.status(status).send(body);
        return;
    }

    const { encoding: rawEncoding } = req.body;
    const encoding = verifyBase64(rawEncoding);

    if (encoding === null) {
        const { status, body } = createErrorUnparsableBase64();
        res.status(status).send(body);
        return;
    }

    const result = await createNewImageResource(potholeId, encoding);
    switch (result.outcome) {
        case 'creation error': {
            const { status, body } = createErrorResourceCreation();
            res.status(status).send(body);
            return;
        }
        case 'upload error': {
            const { status, body } = createErrorResourceCreation();
            res.status(status).send(body);
            return;
        }
        case 'creation success': {
            const { status, body } = createSuccessResourceCreated(result.image);
            res.status(status).send(body);
            return;
        }
    }
});

app.get(`/images/:id`, async (req, res) => {
    const id = Number(req.params.id);

    // Simple validation check here via simply checking for NaN on our conversion
    // This is likely NOT a completely robust solution
    // TODO: more rigorous URL parameter checking?
    if (Number.isNaN(id)) {
        const { status, body } = createErrorInvalidURLParameter('id');
        res.status(status).send(body);
        return;
    }

    const image = await getImageResourceById(id);

    switch (image) {
        // Internal error case case
        case undefined: {
            const { status, body } = createErrorResourceRetrevial();
            res.status(status).send(body);
            return;
        }
        // Doesn't exist case
        case null: {
            const { status, body } = createErrorResourceNonexistant();
            res.status(status).send(body);
            return;
        }
        // Success case
        default: {
            const { status, body } = createSuccessRetrevial(image);
            res.status(status).send(body);
            return;
        }
    }
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

    const potholeId = Number(req.query.pothole);

    // Really simple check that we aren't dealing with a NaN
    // this is acting as validation
    // TODO: more rigorous validation check?
    if (Number.isNaN(potholeId)) {
        const { status, body } = createErrorInvalidURLParameter('pothole');
        res.status(status).send(body);
        return;
    }

    // TODO: this should allllll be in a function tbh
    const { data, error } = await supabase
        .from('images')
        .select('id,createdAt:created_at')
        .eq('pothole_id', potholeId)
        .order('created_at', { ascending: false });

    if (error) {
        const { status, body } = createErrorResourceRetrevial();
        res.status(status).send(body);
        return;
    }

    if (data.length === 0) {
        const { status, body } = createErrorResourceNonexistant();
        res.status(status).send(body);
        return;
    }

    let images: Image[] = [];
    for (const element of data) {
        images.push({
            ...element,
            potholeId,
            url: getImageUrl(element.id),
        });
    }

    const { status, body } = createSuccessResourcesRetrieved(images);
    res.status(status).send(body);
    return;
});

app.listen(port, () => {
    console.log(`AI Pothole API listening on port ${port}`);
});
