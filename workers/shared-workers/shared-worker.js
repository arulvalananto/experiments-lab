const ports = [];

onconnect = (event) => {
    const port = event.ports[0];
    ports.push(port);

    port.onmessage = (e) => {
        // Broadcast to all connected tabs
        ports.forEach((p) => p.postMessage(e.data));
    };

    port.start();
};
