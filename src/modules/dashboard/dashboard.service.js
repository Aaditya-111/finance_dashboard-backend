const pool = require('../../config/db');

const getSummary = async (userId) => {
  const result = await pool.query(
    `SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net_balance
     FROM records
     WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  return result.rows[0];
};

const getCategoryTotals = async (userId) => {
  const result = await pool.query(
    `SELECT
      category,
      type,
      SUM(amount) AS total,
      COUNT(*) AS count
     FROM records
     WHERE user_id = $1 AND deleted_at IS NULL
     GROUP BY category, type
     ORDER BY total DESC`,
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
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId]
  );
  return result.rows;
};

module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentActivity };