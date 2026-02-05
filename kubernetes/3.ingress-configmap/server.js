const express = require('express');
const app = express();

const PORT = 3000;

// Simulate slow startup
let ready = false;
setTimeout(() => {
    ready = true;
    console.log('App is ready');
}, 10000); // 10 seconds

app.get('/', (req, res) => {
    res.send(
        `${process.env.MESSAGE} | Env: ${process.env.APP_ENV} | Pod: ${process.env.HOSTNAME}`,
    );
});

app.get('/cpu', (req, res) => {
    const start = Date.now();
    while (Date.now() - start < 300) {} // burn CPU ~300ms
    res.send(`CPU burned by ${process.env.HOSTNAME}`);
});

// Readiness probe
app.get('/ready', (req, res) => {
    if (ready) return res.sendStatus(200);
    res.sendStatus(503);
});

// Liveness probe
app.get('/health', (req, res) => {
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
