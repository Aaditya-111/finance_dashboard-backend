const ApiError = require('../utils/ApiError');

const permissions = {
  viewer: ['records:read', 'dashboard:read'],
  analyst: ['records:read', 'dashboard:read', 'records:export'],
  admin: ['records:read', 'records:write', 'records:delete', 'dashboard:read', 'users:manage']
};

const authorize = (permission) => (req, res, next) => {
  const userPermissions = permissions[req.user.role] || [];
  if (!userPermissions.includes(permission)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  next();
};

module.exports = { authorize, permissions };