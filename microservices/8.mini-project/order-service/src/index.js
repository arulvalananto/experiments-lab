require('./tracing');
const express = require('express');
const { initDB } = require('./db');
const routes = require('./routes');
const startOutboxWorker = require('./outboxWorker');

const app = express();
app.use(express.json());
app.use(routes);

const PORT = 3000;

async function start() {
    await initDB();
    startOutboxWorker();

    app.listen(PORT, () => {
        console.log(`Order Service running on port ${PORT}`);
    });
}

start();
