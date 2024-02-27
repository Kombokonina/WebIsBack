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
            pictures: pictures.split(','), 
            names: JSON.parse(names), 
            descriptions: JSON.parse(descriptions) 
        });
        await newItem.save();
        res.redirect('/admin'); 
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
