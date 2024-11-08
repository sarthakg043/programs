const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('mydatabase.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    }
});

// Create a users table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        }
    });
});

db.close();