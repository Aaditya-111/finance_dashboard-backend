const pool = require('../../config/db');

const getSummary = async (userId) => {
  const result = await pool.query(
    `SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net_balance,
      COUNT(CASE WHEN status IN ('pending', 'overdue') THEN 1 END) AS pending_payments,
      SUM(CASE WHEN status IN ('pending', 'overdue') THEN amount ELSE 0 END) AS pending_amount
     FROM records
     WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  return result.rows[0];
};

const getTaxEstimate = async (userId) => {
  const result = await pool.query(
    `SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
     FROM records
     WHERE user_id = $1 AND deleted_at IS NULL
     AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())`,
    [userId]
  );

  const { total_income, total_expense } = result.rows[0];
  const net = parseFloat(total_income || 0) - parseFloat(total_expense || 0);

  // Indian freelancer tax slabs
  let estimated_tax = 0;
  if (net <= 250000) estimated_tax = 0;
  else if (net <= 500000) estimated_tax = (net - 250000) * 0.05;
  else if (net <= 1000000) estimated_tax = 12500 + (net - 500000) * 0.20;
  else estimated_tax = 112500 + (net - 1000000) * 0.30;

  return {
    total_income: parseFloat(total_income || 0),
    total_expense: parseFloat(total_expense || 0),
    net_income: net,
    estimated_tax: Math.round(estimated_tax),
    note: 'Estimated based on Indian income tax slabs for FY. Consult a CA for accurate filing.'
  };
};

const getCategoryTotals = async (userId) => {
  const result = await pool.query(
    `SELECT category, type, SUM(amount) AS total, COUNT(*) AS count
     FROM records
     WHERE user_id = $1 AND deleted_at IS NULL
     GROUP BY category, type
     ORDER BY total DESC`,
    [userId]
  );
  return result.rows;
};

const getPlatformBreakdown = async (userId) => {
  const result = await pool.query(
    `SELECT
      platform,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
      COUNT(*) AS transactions
     FROM records
     WHERE user_id = $1 AND deleted_at IS NULL
     GROUP BY platform
     ORDER BY income DESC`,
    [userId]
  );
  return result.rows;
};

const getMonthlyTrends = async (userId) => {
  const result = await pool.query(
    `SELECT
      TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net,
      ROUND(
        (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
         LAG(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END))
         OVER (ORDER BY DATE_TRUNC('month', date))) /
        NULLIF(LAG(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END))
         OVER (ORDER BY DATE_TRUNC('month', date)), 0) * 100, 2
      ) AS income_growth_pct
     FROM records
     WHERE user_id = $1 AND deleted_at IS NULL
     GROUP BY DATE_TRUNC('month', date)
     ORDER BY month DESC`,
    [userId]
  );
  return result.rows;
};

const getRecentActivity = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM records
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC LIMIT 10`,
    [userId]
  );
  return result.rows;
};

const getTopCategories = async (userId) => {
  const result = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM records
     WHERE user_id = $1 AND type = 'income' AND deleted_at IS NULL
     GROUP BY category
     ORDER BY total DESC
     LIMIT 5`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  getSummary, getTaxEstimate, getCategoryTotals,
  getPlatformBreakdown, getMonthlyTrends,
  getRecentActivity, getTopCategories
};