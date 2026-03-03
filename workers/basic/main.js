const worker = new Worker('worker.js');

worker.onmessage = (event) => {
    const { success, buffer } = event.data;

    if (success) {
        const decoder = new TextDecoder();
        const result = JSON.parse(decoder.decode(buffer));
        console.log('Optimized Result:', result);
    }
};

worker.postMessage({
    url: 'https://jsonplaceholder.typicode.com/posts',
});
