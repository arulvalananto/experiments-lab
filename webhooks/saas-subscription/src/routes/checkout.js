const stripe = require('stripe')(process.env.STRIPE_SECRET);

module.exports = async function (fastify) {
    fastify.post('/create-checkout-session', async (request, reply) => {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        return { url: session.url };
    });
};
