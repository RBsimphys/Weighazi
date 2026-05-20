const express = require('express');
const { body, validationResult } = require('express-validator');
const queries = require('./db/queries.js');
const app = express();
const port = 8000;


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


const userArray = [{ name: 'Rami', current_weight: 14, goalweight: 14, progress: 15, height: 1, age: 1, id: 1 }];

const user = userArray[0];
// main page 
app.get('/', async (req, res) => {
    const userArray = await queries.getUserArray();
    res.render('index', { userArray });
});


// user input page 
app.get('/user/:id', async (req, res) => {
    const id = req.params.id;
    const logs = await queries.getWeightList(id);
    const user = await queries.getUser(id);
    console.log(logs);
    console.log(user);
    res.render('userData', {
        user,
        logs
    });
});


app.delete('/user/:id/delete/:weightid', async (req, res) => {
    const id = req.params.id;
    const weightid = req.params.weightid; // was req.params.id
    const deleted = await queries.deleteWeight(id, weightid);
    res.json(deleted); // was console.log(logs)
});


app.get('/user/:id/logs', async (req, res) => {
    const id = req.params.id;
    const logs = await queries.getWeightList(id);
    res.json(logs);
});


app.post('/user/:id', async (req, res) => {
    const id = req.params.id;
    const weight = req.body['add-weight'];
    await queries.addWeight(id, weight);

    const user = await queries.getUser(id);
    const logs = await queries.getWeightList(id);

    res.json({ success: true, user, logs });
});



// lisetning
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});