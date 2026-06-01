const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const AdminUser = require('../models/AdminUser');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, 'Email and password are required', 400);
  }

  const admin = await AdminUser.findOne({ email }).select('+password');
  if (!admin || !(await admin.comparePassword(password))) {
    return error(res, 'Invalid credentials', 401);
  }

  const token = signToken(admin._id);

  success(res, {
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  }, 'Login successful');
});

exports.getMe = asyncHandler(async (req, res) => {
  success(res, {
    id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    role: req.admin.role,
  });
});
