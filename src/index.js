const express = require('express');

const port = process.env.PORT || 4000;
const app = express();
app.get('/', (req, res) => {
    res.send('<h2>Hi from server main page<h2>');
});
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('server is up and running');
});
