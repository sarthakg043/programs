const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('mydatabase.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Home route (Login page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Login endpoint
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password ='${password}'`;
    db.get(query, (err, user) => {
        if (err) {
            return res.status(500).send("An error occurred.");
        }
        if (user) {
            return res.redirect('/welcome'); // Redirect to welcome page
        } else {
            return res.send("Invalid username or password.");
        }
    });
});

app.post('/signup', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(username, password, (err) => {
        if (err) {
            return res.status(500).send("Error during signup.");
        }
        console.log(`User added: ${username}`);
        stmt.finalize();
        res.redirect('/');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});