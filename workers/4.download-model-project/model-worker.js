// Open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('model-store', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore('models');
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Save model
function saveModel(db, key, data) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('models', 'readwrite');
        tx.objectStore('models').put(data, key);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Get model
function getModel(db, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('models', 'readonly');
        const request = tx.objectStore('models').get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

self.onmessage = async (event) => {
    if (event.data.action !== 'loadModel') return;

    const { url } = event.data;

    try {
        const db = await openDB();

        // Check if model already exists
        const cached = await getModel(db, 'main-model');

        if (cached) {
            self.postMessage({ type: 'done', message: 'Loaded from cache' });
            return;
        }

        // Download with streaming
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Download failed');
        }

        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);

        const reader = response.body.getReader();
        let received = 0;
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            received += value.length;

            const progress = Math.round((received / total) * 100);

            self.postMessage({
                type: 'progress',
                progress,
            });
        }

        // Combine chunks
        const modelBlob = new Blob(chunks);

        // Store in IndexedDB
        await saveModel(db, 'main-model', modelBlob);

        self.postMessage({ type: 'done' });
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: error.message,
        });
    }
};
