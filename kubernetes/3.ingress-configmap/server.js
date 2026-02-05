const express = require('express');
const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
    res.send(
        `${process.env.MESSAGE} | Env: ${process.env.APP_ENV} | Pod: ${process.env.HOSTNAME}`,
    );
});

app.get('/cpu', (req, res) => {
    const start = Date.now();
    while (Date.now() - start < 300) {} // burn CPU ~300ms
    res.send(`CPU burned by ${process.env.HOSTNAME}`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
