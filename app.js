const express = require('express');
const path = require('path');
const serverless = require('serverless-http');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { get } = require('http');
const dbUrl = 'mongodb+srv://Kombokonina:kombokonina69@users.oxf09of.mongodb.net/?retryWrites=true&w=majority'


mongoose.connect(dbUrl)
    .then(() => {
        console.info("Connected to the database");
    })  
    .catch((err) => {
        console.log("Error: ", err)
    });

const app = express();

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use('/static', express.static(path.join(__dirname, 'views')));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);


app.get('/', (req, res) => {
    res.render('register');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
module.exports.handler = serverless(app);
