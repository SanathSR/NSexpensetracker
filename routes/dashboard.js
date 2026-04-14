const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {

  // THIS MONTH
  const thisMonth = await pool.query(`
    SELECT COALESCE(SUM(amount),0) FROM transactions
    WHERE date_trunc('month', dateon) = date_trunc('month', CURRENT_DATE)
  `);

  // LAST MONTH
  const lastMonth = await pool.query(`
    SELECT COALESCE(SUM(amount),0) FROM transactions
    WHERE date_trunc('month', dateon) = date_trunc('month', CURRENT_DATE - interval '1 month')
  `);

  // LENDING BALANCE
  const lending = await pool.query(`
    SELECT 
      SUM(CASE WHEN direction='sent' THEN amount ELSE 0 END) -
      SUM(CASE WHEN direction='received' THEN amount ELSE 0 END) AS total
    FROM lending
  `);

  // PIE DATA
  const typePie = await pool.query(`
    SELECT type, SUM(amount) as total
    FROM transactions
    WHERE date_trunc('month', dateon) = date_trunc('month', CURRENT_DATE)
    GROUP BY type
  `);

  // RECENT TRANSACTIONS
  const recentTransactions = await pool.query(`
    SELECT * FROM transactions
    ORDER BY dateon DESC
    LIMIT 15
  `);

  // RECENT LENDING
  const recentLending = await pool.query(`
    SELECT * FROM lending
    ORDER BY dateon DESC
    LIMIT 15
  `);

  res.render('dashboard', {
    thisMonth: thisMonth.rows[0].coalesce,
    lastMonth: lastMonth.rows[0].coalesce,
    lendingTotal: lending.rows[0].total,
    typePie: typePie.rows,
    recentTransactions: recentTransactions.rows,
    recentLending: recentLending.rows
  });
});

module.exports = router;