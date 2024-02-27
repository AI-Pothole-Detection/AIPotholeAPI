import express from 'express';

import { createMissingBodyElement, notImplementedResponse } from './responses';

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
app.post('/potholes/report', (req, res) => {
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

    res.status(501);
    res.send(notImplementedResponse);
    return;
});

app.listen(port, () => {
    console.log(`AI Pothole API listening on port ${port}`);
});
