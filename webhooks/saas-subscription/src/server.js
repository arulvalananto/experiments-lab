require('dotenv').config();
const fastify = require('fastify')({
    logger: true,
});

fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    function (req, body, done) {
        done(null, body);
    },
);

fastify.register(require('./routes/checkout'));
fastify.register(require('./routes/webhook'));

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Server running on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
