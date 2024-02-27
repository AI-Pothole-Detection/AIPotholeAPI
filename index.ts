import express from 'express';
const app = express();
const port = 3000;

// This a JSON API fr fr no cap on a stack
app.use(express.json());

// Endpoint for reporting a pothole
// Critically, this may or may not create a new pothole
// resource, hence it being a "custom" method
app.post('/potholes:report', (req, res) => {
    res.status(501);
    res.send({
        type: 'Error',
        message: 'Not implemented',
    });
});

app.listen(port, () => {
    console.log(`AI Pothole API listening on port ${port}`);
});
