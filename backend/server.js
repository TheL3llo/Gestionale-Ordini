const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Main App static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Uploads static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer Storage Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// --- ORDERS API ---



// Get all orders
app.get('/api/orders', (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY createdAt DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single order with items
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: "Order not found" });

        db.all(`SELECT * FROM items WHERE orderId = ?`, [orderId], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            order.items = items;
            res.json(order);
        });
    });
});

app.post('/api/orders', (req, res) => {
    const { trackingCode } = req.body;
    db.run(
        `INSERT INTO orders (orderNumber, trackingCode) VALUES (?, ?)`,
        ['TEMP', trackingCode],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const newId = this.lastID;
            const seqNumber = String(newId).padStart(3, '0');
            const finalOrderNum = `ORD-${seqNumber}`;

            db.run(
                `UPDATE orders SET orderNumber = ? WHERE id = ?`,
                [finalOrderNum, newId],
                (updateErr) => {
                    if (updateErr) return res.status(500).json({ error: updateErr.message });
                    res.json({ id: newId, orderNumber: finalOrderNum, trackingCode, shippingStatus: 'In preparazione' });
                }
            );
        }
    );
});

// Delete Order
app.delete('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    db.run(`DELETE FROM orders WHERE id = ?`, [orderId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Order deleted" });
    });
});

// Admin endpoint to reset DB
app.delete('/api/debug/reset', (req, res) => {
    db.serialize(() => {
        db.run('DELETE FROM items');
        db.run('DELETE FROM orders');
        db.run('UPDATE sqlite_sequence SET seq = 0 WHERE name = "orders"', [], () => {
            res.json({ message: 'DB reset successfully' });
        });
    });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
    const { shippingStatus } = req.body;
    const orderId = req.params.id;
    db.run(
        `UPDATE orders SET shippingStatus = ? WHERE id = ?`,
        [shippingStatus, orderId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Status updated" });
        }
    );
});

// Update order tracking code
app.put('/api/orders/:id/tracking', (req, res) => {
    const { trackingCode } = req.body;
    const orderId = req.params.id;
    db.run(
        `UPDATE orders SET trackingCode = ? WHERE id = ?`,
        [trackingCode || null, orderId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Tracking code updated" });
        }
    );
});

// --- ITEMS API ---

// Add item to order (with image upload)
app.post('/api/orders/:id/items', upload.single('image'), (req, res) => {
    const orderId = req.params.id;
    const { customText, recipientName, type, basePrice, profit } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const bPrice = parseFloat(basePrice) || 0;
    const pMargin = parseFloat(profit) || 0;

    db.run(
        `INSERT INTO items (orderId, imagePath, customText, recipientName, type, basePrice, profit) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, imagePath, customText, recipientName, type || 'Generico', bPrice, pMargin],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                id: this.lastID,
                orderId,
                imagePath,
                customText,
                recipientName,
                type: type || 'Generico',
                basePrice: bPrice,
                profit: pMargin,
                isDeliveredToRecipient: 0
            });
        }
    );
});

// Update item delivery status (Checklist tick)
app.put('/api/items/:id/delivery', (req, res) => {
    const itemId = req.params.id;
    const { isDeliveredToRecipient } = req.body;

    db.run(
        `UPDATE items SET isDeliveredToRecipient = ? WHERE id = ?`,
        [isDeliveredToRecipient ? 1 : 0, itemId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Item status updated" });
        }
    );
});

// Update item details (Edit item)
app.put('/api/items/:id', upload.single('image'), (req, res) => {
    const itemId = req.params.id;
    const { customText, recipientName, type, basePrice, profit } = req.body;
    const bPrice = parseFloat(basePrice) || 0;
    const pMargin = parseFloat(profit) || 0;

    if (req.file) {
        // New image uploaded: update all fields including imagePath
        const imagePath = `/uploads/${req.file.filename}`;
        db.run(
            `UPDATE items SET imagePath = ?, customText = ?, recipientName = ?, type = ?, basePrice = ?, profit = ? WHERE id = ?`,
            [imagePath, customText, recipientName, type || 'Generico', bPrice, pMargin, itemId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Item updated" });
            }
        );
    } else {
        // No new image: keep existing imagePath
        db.run(
            `UPDATE items SET customText = ?, recipientName = ?, type = ?, basePrice = ?, profit = ? WHERE id = ?`,
            [customText, recipientName, type || 'Generico', bPrice, pMargin, itemId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Item updated" });
            }
        );
    }
});

// Delete an item
app.delete('/api/items/:id', (req, res) => {
    const itemId = req.params.id;
    db.run(`DELETE FROM items WHERE id = ?`, [itemId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item deleted" });
    });
});

// SPA fallback: redirect all other requests to index.html
app.get('*any', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`================================================`);
    console.log(` GESTIONALE PRONTO! `);
    console.log(`================================================`);
    console.log(` Locale:     http://localhost:${port}`);
    console.log(` Rete:       http://192.168.1.234:${port}`);
    console.log(` Pubblico:   https://gest.lellofratm.duckdns.org`);
    console.log(`================================================`);
});
