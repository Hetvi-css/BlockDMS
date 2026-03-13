const User = require('../models/User.model');
const { logAction } = require('../services/audit.service');

// GET /api/users - Admin only
const getUsers = async (req, res) => {
  try {
    const { role, department, isActive, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users - Admin only
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId, phone } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email or Employee ID already exists.' });
    }
    const user = await User.create({ name, email, password, role, department, employeeId, phone, createdBy: req.user._id });
    await logAction({
      action: 'USER_CREATED',
      performedBy: req.user._id,
      targetUser: user._id,
      newState: { name, email, role, department },
      details: `Admin created user ${email}`
    });
    res.status(201).json({ success: true, message: 'User created successfully.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id - Admin only
const updateUser = async (req, res) => {
  try {
    const { name, role, department, phone, isActive } = req.body;
    const previous = await User.findById(req.params.id);
    if (!previous) return res.status(404).json({ success: false, message: 'User not found.' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, department, phone, isActive },
      { new: true, runValidators: true }
    );
    await logAction({
      action: 'USER_UPDATED',
      performedBy: req.user._id,
      targetUser: user._id,
      previousState: { name: previous.name, role: previous.role, department: previous.department },
      newState: { name, role, department },
      details: `Admin updated user ${user.email}`
    });
    res.json({ success: true, message: 'User updated.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/:id - Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin account.' });
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    await logAction({
      action: 'USER_DELETED',
      performedBy: req.user._id,
      targetUser: user._id,
      details: `Admin deactivated user ${user.email}`
    });
    res.json({ success: true, message: 'User deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/stats
const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ isActive: true });
    const byRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const byDepartment = await User.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    res.json({ success: true, stats: { total, active, inactive: total - active, byRole, byDepartment } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getUserStats };
