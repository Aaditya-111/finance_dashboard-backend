const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authentication');
const { authorize } = require('../../middlewares/authorization');
const {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser
} = require('./users.controller');

router.use(authenticate);

router.get('/', authorize('users:manage'), getAllUsers);
router.patch('/:id/role', authorize('users:manage'), updateUserRole);
router.patch('/:id/toggle-status', authorize('users:manage'), toggleUserStatus);
router.delete('/:id', authorize('users:manage'), deleteUser);

module.exports = router;