const express = require('express');
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
let session = require('express-session');
const { body, validationResult } = require('express-validator');
const queries = require('./db/queries.js');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'weighjazi9678',
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 240,
        }

    })
)

// main page 
app.get('/', async (req, res) => {

    req.session.visited = true;
    let user = null;
    if (req.session.user_id) {
        const dbUser = await queries.getUser(req.session.user_id);
        user = {
            id: dbUser.id,
            name: dbUser.name
        };
    }

    const userArray = await queries.getUserArray();

    res.render('index', {
        userArray,
        user
    });
});



app.delete('/user/delete/:id/:weightid', requireSameUser, async (req, res) => {
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
app.post('/user/:id', requireSameUser, async (req, res) => {
    const id = req.params.id;
    const weight = req.body['add-weight'];

    await queries.addWeight(id, weight);

    const user = await queries.getUser(id);
    const logs = await queries.getWeightList(id);

    res.json({ success: true, user, logs });
});
app.get('/api/user/:id', async (req, res) => {
    const user = await queries.getUser(req.params.id);
    res.json(user);
});

app.get('/user/:id', async (req, res) => {
    const id = req.params.id;

    const logs = await queries.getWeightList(id);
    const user = await queries.getUser(id);

    res.render('userData', {
        user,
        logs,
        sessionUserId: req.session.user_id
    });
});

// sign up page
app.get('/signup', async (req, res) => {
    res.render('signup');
});


app.post("/signup", async (req, res) => {
    try {
        const { password } = req.body;
        const hashpassword = await bcrypt.hash(password, 10);
        const newUser = await queries.createUser(req.body, hashpassword);
        await queries.createWeightLog(newUser.id, newUser.startingweight);
        const userArray = await queries.getUserArray();

        res.redirect("/");
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).send("Username already exists");
        }
        res.status(500).send("Something went wrong");
    }

});


// login page
app.get('/login', async (req, res) => {

    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await queries.findUserName(name);

        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        req.session.user_id = user.id;

        req.session.save((err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Session error");
            }

            res.redirect(`/user/${user.id}`);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error logging in' });
    }
});


// logout

app.post('/logout', (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.log(err);
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');

        res.redirect('/');
    });
});
// lisetning
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});



function requireSameUser(req, res, next) {
    const sessionUserId = Number(req.session.user_id);
    const paramsUserId = Number(req.params.id);

    if (!sessionUserId) {
        return res.status(401).json({ success: false, error: "Not logged in" });
    }

    if (sessionUserId !== paramsUserId) {
        return res.status(403).json({ success: false, error: "Not allowed" });
    }

    next();
}