const pool = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const createRecord = async (userId, data) => {
  const { amount, type, category, date, notes } = data;
  const result = await pool.query(
    `INSERT INTO records (user_id, amount, type, category, date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, amount, type, category, date || new Date(), notes || null]
  );
  return result.rows[0];
};

const getRecords = async (userId, filters) => {
  const { type, category, date_from, date_to, limit = 10, offset = 0 } = filters;
  let query = `SELECT * FROM records WHERE user_id = $1 AND deleted_at IS NULL`;
  const params = [userId];
  let paramCount = 1;

  if (type) { paramCount++; query += ` AND type = $${paramCount}`; params.push(type); }
  if (category) { paramCount++; query += ` AND category = $${paramCount}`; params.push(category); }
  if (date_from) { paramCount++; query += ` AND date >= $${paramCount}`; params.push(date_from); }
  if (date_to) { paramCount++; query += ` AND date <= $${paramCount}`; params.push(date_to); }

  paramCount++; query += ` ORDER BY date DESC LIMIT $${paramCount}`; params.push(limit);
  paramCount++; query += ` OFFSET $${paramCount}`; params.push(offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const getRecordById = async (userId, recordId) => {
  const result = await pool.query(
    `SELECT * FROM records WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [recordId, userId]
  );
  if (!result.rows[0]) throw new ApiError(404, 'Record not found');
  return result.rows[0];
};

const updateRecord = async (userId, recordId, data) => {
  const existing = await getRecordById(userId, recordId);
  const amount = data.amount ?? existing.amount;
  const type = data.type ?? existing.type;
  const category = data.category ?? existing.category;
  const date = data.date ?? existing.date;
  const notes = data.notes ?? existing.notes;

  const result = await pool.query(
    `UPDATE records SET amount = $1, type = $2, category = $3, date = $4, notes = $5, updated_at = NOW()
     WHERE id = $6 AND user_id = $7 AND deleted_at IS NULL RETURNING *`,
    [amount, type, category, date, notes, recordId, userId]
  );
  return result.rows[0];
};

const deleteRecord = async (userId, recordId) => {
  await getRecordById(userId, recordId);
  await pool.query(
    `UPDATE records SET deleted_at = NOW() WHERE id = $1 AND user_id = $2`,
    [recordId, userId]
  );
  return { message: 'Record deleted successfully' };
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };