const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/authMiddleware');
const validateAdmin = require('../utils/validateAdmin');

// LIST
router.get('/', auth, async (req, res) => {
  try {

    const { from, to, type, amount } = req.query;

    let query = `SELECT * FROM transactions WHERE 1=1`;
    let values = [];
    let idx = 1;

    // 📅 FROM DATE
    if (from) {
      query += ` AND dateon >= $${idx}`;
      values.push(from);
      idx++;
    }

    // 📅 TO DATE
    if (to) {
      query += ` AND dateon <= $${idx}`;
      values.push(to);
      idx++;
    }

    // 🏷 TYPE FILTER
    if (type) {
      query += ` AND type = $${idx}`;
      values.push(type);
      idx++;
    }

    // 💰 MIN AMOUNT
    if (amount) {
      query += ` AND amount >= $${idx}`;
      values.push(amount);
      idx++;
    }

    // ORDER
    query += ` ORDER BY dateon DESC`;

    const result = await pool.query(query, values);

    res.render('transactions', {
      data: result.rows,
      filters: req.query
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading transactions");
  }
});

// CREATE PAGE
router.get('/create', auth, (req, res) => {
  res.render('createTransaction');
});

// CREATE
router.post('/create', auth, async (req, res) => {
  const { dateon, amount, mode, purpose, to_whom, type, comments } = req.body;

  await pool.query(
    `INSERT INTO transactions(dateon,amount,mode,purpose,to_whom,type,comments)
     VALUES($1,$2,$3,$4,$5,$6,$7)`,
    [dateon, amount, mode, purpose, to_whom, type, comments]
  );

  res.redirect('/transactions');
});

// EDIT PAGE
router.get('/edit/:id', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM transactions WHERE id=$1',
    [req.params.id]
  );

  res.render('editTransaction', { data: result.rows[0] });
});

// UPDATE
router.post('/edit/:id', auth, async (req, res) => {
  const { adminPassword, formData } = req.body;

  const isValid = await validateAdmin(req.session.user.id, adminPassword);
  if (!isValid) return res.json({ success: false, message: 'Invalid password' });

  const data = JSON.parse(formData);

  await pool.query(
    `UPDATE transactions SET dateon=$1,amount=$2,mode=$3,purpose=$4,to_whom=$5,type=$6,comments=$7 WHERE id=$8`,
    [
      data.dateon,
      data.amount,
      data.mode,
      data.purpose,
      data.to_whom,
      data.type,
      data.comments,
      req.params.id
    ]
  );

  res.json({ success: true });
});

// DELETE
router.post('/delete/:id', auth, async (req, res) => {
  const { adminPassword } = req.body;

  const isValid = await validateAdmin(req.session.user.id, adminPassword);
  if (!isValid) return res.json({ success: false, message: 'Invalid password' });

  await pool.query('DELETE FROM transactions WHERE id=$1', [req.params.id]);

  res.json({ success: true });
});

module.exports = router;