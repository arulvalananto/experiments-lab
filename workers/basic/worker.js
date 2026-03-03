self.onmessage = async (event) => {
    const { url } = event.data;

    try {
        // 1️⃣ Call API inside worker
        const response = await fetch(url);
        const data = await response.json();

        // 2️⃣ Simulate large data processing
        const processed = data.map((item) => ({
            id: item.id,
            title: item.title.toUpperCase(),
        }));

        // 3️⃣ Convert to optimized format (ArrayBuffer)
        const encoder = new TextEncoder();
        const buffer = encoder.encode(JSON.stringify(processed));

        // 4️⃣ Return using Transferable (zero-copy)
        self.postMessage({ success: true, buffer }, [buffer.buffer]);
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};
