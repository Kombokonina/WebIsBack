const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.send('User already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
      res.redirect('/login');
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid username or password');
    }
    req.session.user = user;
    res.redirect('/weather');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;