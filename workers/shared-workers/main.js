const worker = new SharedWorker('shared-worker.js');

worker.port.start();

worker.port.onmessage = (event) => {
    console.log('Received:', event.data);
};

function sendMessage() {
    worker.port.postMessage('Hello from tab!');
}
