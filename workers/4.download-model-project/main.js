const worker = new Worker('model-worker.js');

worker.onmessage = (event) => {
    const { type, progress, message } = event.data;

    if (type === 'progress') {
        console.log('Download progress:', progress + '%');
    }

    if (type === 'done') {
        console.log('Model ready!');
    }

    if (type === 'error') {
        console.error('Error:', message);
    }
};

// Start model load
worker.postMessage({
    action: 'loadModel',
    url: 'large-model.bin',
});
