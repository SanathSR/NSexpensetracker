const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/authMiddleware');
const validateAdmin = require('../utils/validateAdmin');

// LIST
router.get('/', auth, async (req, res) => {

  try {

    const { from, to, direction, amount } = req.query;

    let query = `SELECT * FROM lending WHERE 1=1`;
    let values = [];
    let idx = 1;

    // 📅 FROM
    if (from) {
      query += ` AND dateon >= $${idx}`;
      values.push(from);
      idx++;
    }

    // 📅 TO
    if (to) {
      query += ` AND dateon <= $${idx}`;
      values.push(to);
      idx++;
    }

    // 🔄 direction (sent/received)
    if (direction) {
      query += ` AND direction = $${idx}`;
      values.push(direction);
      idx++;
    }

    // 💰 min amount
    if (amount) {
      query += ` AND amount >= $${idx}`;
      values.push(amount);
      idx++;
    }

    query += ` ORDER BY dateon DESC`;

    const result = await pool.query(query, values);

    res.render('lending', {
      data: result.rows,
      filters: req.query
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading lending");
  }
});
// CREATE PAGE
router.get('/create', auth, (req, res) => {
  res.render('createLending');
});

// CREATE
router.post('/create', auth, async (req, res) => {
  const { dateon, to_whom, amount, mode, comments, direction } = req.body;

  await pool.query(
    `INSERT INTO lending(dateon,to_whom,amount,mode,comments,direction)
     VALUES($1,$2,$3,$4,$5,$6)`,
    [dateon, to_whom, amount, mode, comments, direction]
  );

  res.redirect('/lending');
});

// EDIT PAGE
router.get('/edit/:id', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM lending WHERE id=$1',
    [req.params.id]
  );

  res.render('editLending', { data: result.rows[0] });
});

// UPDATE
router.post('/edit/:id', auth, async (req, res) => {
  const { adminPassword, formData } = req.body;

  const isValid = await validateAdmin(req.session.user.id, adminPassword);
  if (!isValid) return res.json({ success: false, message: 'Invalid password' });

  const data = JSON.parse(formData);

  await pool.query(
    `UPDATE lending SET dateon=$1,to_whom=$2,amount=$3,mode=$4,comments=$5,direction=$6 WHERE id=$7`,
    [
      data.dateon,
      data.to_whom,
      data.amount,
      data.mode,
      data.comments,
      data.direction,
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

  await pool.query('DELETE FROM lending WHERE id=$1', [req.params.id]);

  res.json({ success: true });
});

module.exports = router;