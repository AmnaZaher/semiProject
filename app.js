const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// استدعاء الراوترز
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const noteRoutes = require('./routes/noteRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/notes', noteRoutes);
app.use('/profile', profileRoutes);                                                                                                                                         

// Route for homepage
app.get('/', (req, res) => {
    res.render('index', { title: "Homepage" });
});

module.exports = app;
