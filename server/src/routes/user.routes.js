const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, getUserStats } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/stats', authorize('admin'), getUserStats);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUserById);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
