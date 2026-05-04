const express = require('express');
const PORT = 3000;
const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('hello')
});

app.listen(PORT)