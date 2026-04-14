require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/transactions', require('./routes/transactions'));
app.use('/lending', require('./routes/lending'));

app.listen(3000, () => console.log('Running on 3000'));