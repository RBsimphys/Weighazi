const express = require('express');
const { body, validationResult } = require('express-validator');
const queries = require('./db/queries.js');
const app = express();
const port = 8080;


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

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
    res.render('userData', {
        user,
        logs
    });
});


app.delete('/user/delete/:id/:weightid', async (req, res) => {
    const { id, weightid } = req.params;
    const deleted = await queries.deleteWeight(id, weightid);
    if (deleted) {
        res.json({ success: true, deleted });
    } else {
        res.json({ success: false, reason: 'Cannot delete the first log' });
    }
});

app.get('/user/:id/logs', async (req, res) => {
    const id = req.params.id;
    const logs = await queries.getWeightList(id);
    res.json(logs);
});

app.get('/api/user/:id', async (req, res) => {
    const user = await queries.getUser(req.params.id);
    res.json(user);
});

app.post('/user/:id', async (req, res) => {
    const id = req.params.id;
    const weight = req.body['add-weight'];
    await queries.addWeight(id, weight);

    const user = await queries.getUser(id);
    const logs = await queries.getWeightList(id);

    res.json({ success: true, user, logs });
});


// sign up page
app.get('/signup', async (req, res) => {
    res.render('signup');
});


app.post("/signup", async (req, res) => {
    try {

        const newUser = await queries.createUser(req.body);
        const initialWeightLog = await queries.createWeightLog(newUser.id, newUser.startingweight);
        const userArray = await queries.getUserArray();
        res.render('index', { userArray });

    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).send("Username already exists");
        }
        res.status(500).send(err);
    }
});


// login page

app.get('/login', (req,res)=>{
    res.render('login');
});

// lisetning
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
