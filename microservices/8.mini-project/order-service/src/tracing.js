const { NodeSDK } = require('@opentelemetry/sdk-node');
const {
    getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
    OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const {
    SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');

const exporter = new OTLPTraceExporter({
    url: 'http://jaeger:4318/v1/traces',
});

const sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: resourceFromAttributes({
        [SemanticResourceAttributes.SERVICE_NAME]:
            process.env.SERVICE_NAME || 'order-service',
    }),
});

sdk.start();

console.log('Tracing initialized');
