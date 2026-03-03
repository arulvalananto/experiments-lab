self.onmessage = (event) => {
    const { number } = event.data;

    // Heavy computation simulation
    let result = 0;
    for (let i = 0; i < 1e8; i++) {
        result += number;
    }

    self.postMessage(result);
};
