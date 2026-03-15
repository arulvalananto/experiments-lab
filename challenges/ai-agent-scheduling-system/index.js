const dotenv = require('dotenv');
dotenv.config();

const Fastify = require('fastify');
const scheduler = require('./scheduler');
const api = require('./api');
const monitor = require('./monitor');
const { init } = require('./db');
init();

const fastify = Fastify({ logger: true });

// Register API and monitoring routes
fastify.register(api);
fastify.register(monitor);

// Start scheduler
scheduler.start();

const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});
