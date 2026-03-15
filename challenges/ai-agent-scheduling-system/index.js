import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import { start as schedulerStart } from './scheduler.js';
import api from './api.js';
import monitor from './monitor.js';
import { init } from './db.js';
init();

const fastify = Fastify({ logger: true });

// Register API and monitoring routes
fastify.register(api);
fastify.register(monitor);

// Start scheduler
schedulerStart();

const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});
