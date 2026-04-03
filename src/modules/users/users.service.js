const pool = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const getAllUsers = async () => {
  const result = await pool.query(
    'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

const updateUserRole = async (userId, role) => {
  const validRoles = ['viewer', 'analyst', 'admin'];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, 'Invalid role. Must be viewer, analyst or admin');
  }

  const result = await pool.query(
    `UPDATE users SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, is_active`,
    [role, userId]
  );

  if (!result.rows[0]) throw new ApiError(404, 'User not found');
  return result.rows[0];
};

const toggleUserStatus = async (userId) => {
  const result = await pool.query(
    `UPDATE users SET is_active = NOT is_active, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role, is_active`,
    [userId]
  );

  if (!result.rows[0]) throw new ApiError(404, 'User not found');
  return result.rows[0];
};

const deleteUser = async (userId) => {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [userId]
  );
  if (!result.rows[0]) throw new ApiError(404, 'User not found');
  return { message: 'User deleted successfully' };
};

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, deleteUser };