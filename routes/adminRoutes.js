const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check admin status
const isAdmin = (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Access denied');
  }
  next();
};

router.get('/admin', isAdmin, (req, res) => {
  // Render admin panel
  res.render('admin');
});

module.exports = router;
