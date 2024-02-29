import express from 'express';

import { createMissingBodyElement, notImplementedResponse } from './responses';
import { supabase } from './supabase';
import { isConstructorDeclaration } from 'typescript';

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
app.post('/potholes/report', async (req, res) => {
    const body: ReportBody = req.body;

    const { longitude: rawLongitude, latitude: rawLatitude } = body;

    // Now we gotta manually verify the types like goddamn cave men
    const longitude = Number(rawLongitude);
    const latitude = Number(rawLatitude);

    if (Number.isNaN(longitude)) {
        const { status, body } = createMissingBodyElement('longitude');
        res.status(status);
        res.send(body);
        return;
    }

    if (Number.isNaN(latitude)) {
        const { status, body } = createMissingBodyElement('latitude');
        res.status(status);
        res.send(body);
        return;
    }

    const rpcRes = await supabase.rpc('nearby_potholes', {
        lat: latitude,
        long: longitude,
    });

    console.log(rpcRes);

    // So here,
    // we should really check for an existing Pothole resource
    // and if it exists, increment the count and reset the counter
    // BUT! we aren't going to do that,
    // Instead I'm just going to create a row :)

    // const { data, error } = await supabase
    //     .from('potholes')
    //     .insert({ location: `POINT(${longitude} ${latitude})` })
    //     .select('*');
    // console.log(data, error);

    res.status(501);
    res.send(notImplementedResponse);
    return;
});

app.listen(port, () => {
    console.log(`AI Pothole API listening on port ${port}`);
});
