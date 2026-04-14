const ExcelJS = require('exceljs');
const pool = require('../db');

async function exportExcel(res) {
  const workbook = new ExcelJS.Workbook();

  const tSheet = workbook.addWorksheet('Transactions');
  const lSheet = workbook.addWorksheet('Lending');

  const tData = await pool.query('SELECT * FROM transactions');
  const lData = await pool.query('SELECT * FROM lending');

  tSheet.columns = Object.keys(tData.rows[0] || {}).map(k => ({ header: k, key: k }));
  tSheet.addRows(tData.rows);

  lSheet.columns = Object.keys(lData.rows[0] || {}).map(k => ({ header: k, key: k }));
  lSheet.addRows(lData.rows);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = exportExcel;