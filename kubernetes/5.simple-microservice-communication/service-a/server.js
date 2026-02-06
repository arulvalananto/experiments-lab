import fetch from 'node-fetch';
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (_, res) => {
    res.send('Hello from Service A');
});

app.get('/call-b', async (_, res) => {
    try {
        const response = await fetch('http://service-b:4000/data');
        const text = await response.text();
        res.send(`Service B says: ${text}`);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.listen(PORT, '0.0.0.0', () =>
    console.log(`Service A running on port ${PORT}`),
);
