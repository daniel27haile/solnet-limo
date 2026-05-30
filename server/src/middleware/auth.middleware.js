const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const asyncHandler = require('../utils/asyncHandler');
const { error } = require('../utils/apiResponse');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Not authorized, no token', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.admin = await AdminUser.findById(decoded.id);

  if (!req.admin) {
    return error(res, 'Not authorized, user not found', 401);
  }

  next();
});

const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    return next();
  }
  return error(res, 'Access denied: superadmin only', 403);
};

module.exports = { protect, superAdminOnly };
