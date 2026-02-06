const express = require('express');
const app = express();
const PORT = 4000;

app.get('/data', (req, res) => {
    res.json({ message: 'Hello from Service B' });
});

app.listen(PORT, () => console.log(`Service B running on port ${PORT}`));
