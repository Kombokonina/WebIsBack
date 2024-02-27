// adminRoutes.js
const express = require('express');
const router = express.Router();
const Item = require('../models/item');

// Middleware to check admin status
const isAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).send('Access denied');
    }
    next();
};

// Route for displaying admin panel
router.get('/admin', isAdmin, (req, res) => {
    res.render('admin');
});

// Route for adding a new item
router.post('/admin/addItem', isAdmin, async (req, res) => {
    try {
        const { pictures, names, descriptions } = req.body;
        const newItem = new Item({
            pictures: pictures.split(','), // Split comma-separated URLs into an array
            names: JSON.parse(names), // Parse JSON string into an array of objects
            descriptions: JSON.parse(descriptions) // Parse JSON string into an array of objects
        });
        await newItem.save();
        res.redirect('/admin'); // Redirect to admin panel after adding item
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
