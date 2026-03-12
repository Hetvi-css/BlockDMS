const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const User = require('../models/User');
const AuditService = require('../services/auditService');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// GET /api/departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).populate('hod', 'name email').populate('createdBy', 'name');
        res.json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/departments (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
    try {
        const { name, code, description, hodId } = req.body;
        if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required.' });

        const existing = await Department.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
        if (existing) return res.status(400).json({ success: false, message: 'Department name or code already exists.' });

        const dept = await Department.create({
            name: name.trim(), code: code.toUpperCase(), description,
            hod: hodId || null, createdBy: req.user._id
        });

        if (hodId) {
            await User.findByIdAndUpdate(hodId, { department: dept._id });
        }

        await AuditService.log({
            userId: req.user._id, userName: req.user.name, userRole: req.user.role,
            action: 'DEPARTMENT_CREATED', newState: { name, code },
            details: `Department created: ${name}`, ipAddress: req.ip
        });

        res.status(201).json({ success: true, department: dept });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/departments/:id (admin only)
router.put('/:id', requireRole('admin'), async (req, res) => {
    try {
        const { name, description, hodId, isActive } = req.body;
        const dept = await Department.findById(req.params.id);
        if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });

        const prevHodId = dept.hod;
        if (name) dept.name = name;
        if (description !== undefined) dept.description = description;
        if (hodId !== undefined) dept.hod = hodId || null;
        if (isActive !== undefined) dept.isActive = isActive;
        await dept.save();

        // Update user department assignments
        if (hodId && hodId !== prevHodId?.toString()) {
            if (prevHodId) await User.findByIdAndUpdate(prevHodId, { department: null });
            await User.findByIdAndUpdate(hodId, { department: dept._id });
        }

        await AuditService.log({
            userId: req.user._id, userName: req.user.name, userRole: req.user.role,
            action: 'DEPARTMENT_UPDATED', details: `Department updated: ${dept.name}`, ipAddress: req.ip
        });

        res.json({ success: true, department: dept });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/departments/:id (admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
        const dept = await Department.findById(req.params.id);
        if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });
        dept.isActive = false;
        await dept.save();

        await AuditService.log({
            userId: req.user._id, userName: req.user.name, userRole: req.user.role,
            action: 'DEPARTMENT_DELETED', details: `Department deactivated: ${dept.name}`, ipAddress: req.ip
        });

        res.json({ success: true, message: 'Department deactivated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
