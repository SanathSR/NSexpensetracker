const pool = require('../db');
const bcrypt = require('bcrypt');

module.exports = async (userId, password) => {
  const user = await pool.query(
    'SELECT admin_password FROM users WHERE id=$1',
    [userId]
  );

  if (!user.rows.length) return false;

  return await bcrypt.compare(password, user.rows[0].admin_password);
};