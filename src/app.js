//Modules
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signupCollection, categorieCollection, threadCollection, commentCollection } = require('./models/collection');
const router = require('./models/route');
const { count } = require('console');
const port = process.env.PORT || 8000;
require('./db/conn');

// Paths
const staticPath = path.join(__dirname, '../public');
const templatePath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

//Middleware
app.use('/public', express.static(path.join(__dirname, '../public/categoryimg')));
app.use(express.static(staticPath));
app.use(express.json());
app.use(router);
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));
app.set('view engine', 'hbs');
app.set('views', templatePath);
hbs.registerPartials(partialsPath);


//Listening Server
app.listen(port, (req, res) => {
    console.log('listening on port ' + port);
});