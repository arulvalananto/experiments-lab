require('./tracing');
const { connectRabbit } = require('./saga');

connectRabbit();
console.log('Payment Service running');
