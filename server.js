const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB } = require('./config/connectDB'); 

const app = express();


app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));

connectDB();

mongoose.connection.once('connected', () => {
    console.log("✅ MongoDB connected successfully...");
    app.listen(process.env.PORT || 3000, () =>
        console.log(`Server running on http://localhost:${process.env.PORT || 3000}`)
    );
});

mongoose.connection.on('error', (err) => {
    console.error("MongoDB connection error:", err);
});


app.get('/', (req, res) => {
    res.render('index', { title: "Homepage" });
});

module.exports = { app };
