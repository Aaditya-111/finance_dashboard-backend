const asyncHandler = require('../../utils/asyncHandler');
const usersService = require('./users.service');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await usersService.getAllUsers();
  res.status(200).json({ success: true, count: users.length, data: users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserRole(req.params.id, req.body.role);
  res.status(200).json({ success: true, message: 'User role updated successfully', data: user });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await usersService.toggleUserStatus(req.params.id);
  const status = user.is_active ? 'activated' : 'deactivated';
  res.status(200).json({ success: true, message: `User ${status} successfully`, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await usersService.deleteUser(req.params.id);
  res.status(200).json({ success: true, message: result.message });
});

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, deleteUser };