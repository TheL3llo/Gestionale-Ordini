const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                "orderNumber" TEXT NOT NULL UNIQUE,
                "trackingCode" TEXT,
                "shippingStatus" TEXT DEFAULT 'In preparazione',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                "orderId" INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                "imagePath" TEXT,
                "customText" TEXT,
                "recipientName" TEXT,
                type TEXT DEFAULT 'Generico',
                "basePrice" NUMERIC DEFAULT 0,
                profit NUMERIC DEFAULT 0,
                "isDeliveredToRecipient" BOOLEAN DEFAULT FALSE
            )
        `);

        await client.query('COMMIT');
        console.log('Connected to Postgres and tables ensured.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error initializing database', e);
        throw e;
    } finally {
        client.release();
    }
};

// Initialize DB on module load
initDb();

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
