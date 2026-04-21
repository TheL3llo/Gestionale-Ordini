const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Enforce foreign keys
        db.run('PRAGMA foreign_keys = ON;');
        
        // Setup tables
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderNumber TEXT NOT NULL UNIQUE,
                trackingCode TEXT,
                shippingStatus TEXT DEFAULT 'In preparazione',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId INTEGER,
                imagePath TEXT,
                customText TEXT,
                recipientName TEXT,
                type TEXT DEFAULT 'Generico',
                basePrice REAL DEFAULT 0,
                profit REAL DEFAULT 0,
                isDeliveredToRecipient BOOLEAN DEFAULT 0,
                FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE
            )`);
        });
    }
});

module.exports = db;
