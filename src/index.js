const express = require('express');

const port = process.env.PORT || 4000;
const app = express();
app.get('/', (req, res) => {
    console.log('Got a request');
    res.send(JSON.stringify('<h3>Hi From Backend API</h3>'));
    return res;
});
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('server is up and running on port:', port);
});
