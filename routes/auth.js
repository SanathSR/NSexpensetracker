const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// login page
router.get('/', (req, res) => {
  res.render('login');
});

// login
router.post('/login', async (req, res) => {
   try {
  const { username, password } = req.body;

  const user = await pool.query(
    'SELECT id, username, password FROM users WHERE username=$1',
    [username]
  );

  if (!user.rows.length) {
      return res.render('login', { error: 'User not found' });
    }

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) {
      return res.render('login', { error: 'Invalid password' });
    }
  // ✅ ONLY STORE SAFE DATA
  req.session.user = {
    id: user.rows[0].id,
    username: user.rows[0].username
  };

  res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('login', { error: 'Something went wrong' });
  }
});

// logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;