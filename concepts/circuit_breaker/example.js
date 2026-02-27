// paymentClient.js
const axios = require('axios');

async function callPaymentService(payload) {
    const response = await axios.post('http://localhost:4001/pay', payload, {
        timeout: 3000,
    });

    return response.data;
}

// circuitBreaker.js
const CircuitBreaker = require('opossum');
const callPaymentService = require('./paymentClient');

const options = {
    timeout: 5000, // If function takes > 5 sec → failure
    errorThresholdPercentage: 50, // % of failures before opening
    resetTimeout: 10000, // After 10 sec → try again (half-open)
    rollingCountTimeout: 10000, // Time window for stats
    rollingCountBuckets: 10,
};

const breaker = new CircuitBreaker(callPaymentService, options);

// Fallback response
breaker.fallback(() => {
    return {
        success: false,
        message: 'Payment service temporarily unavailable',
    };
});

// Event listeners (very important in production)
breaker.on('open', () => console.log('⚠ Circuit OPEN'));
breaker.on('halfOpen', () => console.log('🔄 Circuit HALF-OPEN'));
breaker.on('close', () => console.log('✅ Circuit CLOSED'));
breaker.on('failure', (err) => console.log('❌ Failure:', err.message));

// server.js
const fastify = require('fastify')({ logger: true });

fastify.post('/pay', async (request, reply) => {
    try {
        const result = await breaker.fire(request.body);
        return result;
    } catch (err) {
        reply.status(500).send({
            success: false,
            message: 'Unexpected error',
        });
    }
});

fastify.listen({ port: 3000 });
