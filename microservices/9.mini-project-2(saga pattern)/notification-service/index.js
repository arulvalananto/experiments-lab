require('./tracing');
const { connectRabbit } = require('./saga');

connectRabbit();
console.log('Notification Service running');
