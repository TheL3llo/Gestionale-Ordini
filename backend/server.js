const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'gestionale_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    },
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// Main App static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// --- ORDERS API ---

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM orders ORDER BY "createdAt" DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single order with items
app.get('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id;
    try {
        const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (orderResult.rows.length === 0) return res.status(404).json({ error: "Order not found" });

        const itemsResult = await db.query('SELECT * FROM items WHERE "orderId" = $1', [orderId]);
        const order = orderResult.rows[0];
        order.items = itemsResult.rows;
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create order
app.post('/api/orders', async (req, res) => {
    const { trackingCode } = req.body;
    try {
        const insertResult = await db.query(
            'INSERT INTO orders ("orderNumber", "trackingCode") VALUES ($1, $2) RETURNING id',
            ['TEMP', trackingCode]
        );
        const newId = insertResult.rows[0].id;
        const seqNumber = String(newId).padStart(3, '0');
        const finalOrderNum = `ORD-${seqNumber}`;

        await db.query(
            'UPDATE orders SET "orderNumber" = $1 WHERE id = $2',
            [finalOrderNum, newId]
        );

        res.json({ id: newId, orderNumber: finalOrderNum, trackingCode, shippingStatus: 'In preparazione' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Order
app.delete('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id;
    try {
        await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
        res.json({ message: "Order deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin endpoint to reset DB
app.delete('/api/debug/reset', async (req, res) => {
    try {
        await db.query('DELETE FROM items');
        await db.query('DELETE FROM orders');
        // Reset serial is handled automatically or by:
        await db.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE items_id_seq RESTART WITH 1');
        res.json({ message: 'DB reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
    const { shippingStatus } = req.body;
    const orderId = req.params.id;
    try {
        await db.query(
            'UPDATE orders SET "shippingStatus" = $1 WHERE id = $2',
            [shippingStatus, orderId]
        );
        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update order tracking code
app.put('/api/orders/:id/tracking', async (req, res) => {
    const { trackingCode } = req.body;
    const orderId = req.params.id;
    try {
        await db.query(
            'UPDATE orders SET "trackingCode" = $1 WHERE id = $2',
            [trackingCode || null, orderId]
        );
        res.json({ message: "Tracking code updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ITEMS API ---

// Add item to order (with image upload)
app.post('/api/orders/:id/items', upload.single('image'), async (req, res) => {
    const orderId = req.params.id;
    const { customText, recipientName, type, basePrice, profit } = req.body;
    const imagePath = req.file ? req.file.path : null; // Cloudinary URL

    const bPrice = parseFloat(basePrice) || 0;
    const pMargin = parseFloat(profit) || 0;

    try {
        const result = await db.query(
            `INSERT INTO items ("orderId", "imagePath", "customText", "recipientName", type, "basePrice", profit) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [orderId, imagePath, customText, recipientName, type || 'Generico', bPrice, pMargin]
        );
        res.json({
            id: result.rows[0].id,
            orderId,
            imagePath,
            customText,
            recipientName,
            type: type || 'Generico',
            basePrice: bPrice,
            profit: pMargin,
            isDeliveredToRecipient: false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update item delivery status (Checklist tick)
app.put('/api/items/:id/delivery', async (req, res) => {
    const itemId = req.params.id;
    const { isDeliveredToRecipient } = req.body;
    try {
        await db.query(
            'UPDATE items SET "isDeliveredToRecipient" = $1 WHERE id = $2',
            [!!isDeliveredToRecipient, itemId]
        );
        res.json({ message: "Item status updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update item details (Edit item)
app.put('/api/items/:id', upload.single('image'), async (req, res) => {
    const itemId = req.params.id;
    const { customText, recipientName, type, basePrice, profit } = req.body;
    const bPrice = parseFloat(basePrice) || 0;
    const pMargin = parseFloat(profit) || 0;

    try {
        if (req.file) {
            const imagePath = req.file.path; // New Cloudinary URL
            await db.query(
                `UPDATE items SET "imagePath" = $1, "customText" = $2, "recipientName" = $3, type = $4, "basePrice" = $5, profit = $6 
                 WHERE id = $7`,
                [imagePath, customText, recipientName, type || 'Generico', bPrice, pMargin, itemId]
            );
        } else {
            await db.query(
                `UPDATE items SET "customText" = $1, "recipientName" = $2, type = $3, "basePrice" = $4, profit = $5 
                 WHERE id = $6`,
                [customText, recipientName, type || 'Generico', bPrice, pMargin, itemId]
            );
        }
        res.json({ message: "Item updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        await db.query('DELETE FROM items WHERE id = $1', [itemId]);
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SPA fallback
app.get('*any', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`================================================`);
    console.log(` GESTIONALE PRONTO (POSTGRES + CLOUDINARY) `);
    console.log(`================================================`);
    console.log(` Port:       ${port}`);
    console.log(`================================================`);
});
