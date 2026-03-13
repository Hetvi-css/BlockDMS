require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Block = require('./models/Block');
const BlockchainService = require('./services/blockchainService');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected for seeding...');

        // Clear existing data
        await Promise.all([User.deleteMany(), Department.deleteMany(), Block.deleteMany()]);
        console.log('🗑️  Cleared existing data');

        // Create Admin (ONLY ONE ADMIN ALLOWED)
        const admin = await User.create({
            name: 'Dr. Rajesh Kumar',
            email: 'admin@ipr.gov.in',
            password: await bcrypt.hash('Admin@123', 12),
            role: 'admin',
            isActive: true,
            isApproved: true,
            employeeId: 'IPR-ADMIN-001'
        });
        console.log(`✅ Admin created: ${admin.email}`);

        // Create Departments
        const depts = await Department.insertMany([
            { name: 'Research & Development', code: 'RND', description: 'Core research department', createdBy: admin._id },
            { name: 'Human Resources', code: 'HR', description: 'HR and personnel management', createdBy: admin._id },
            { name: 'Finance & Accounts', code: 'FIN', description: 'Financial operations', createdBy: admin._id },
            { name: 'Information Technology', code: 'IT', description: 'IT infrastructure and support', createdBy: admin._id },
            { name: 'Administration', code: 'ADMIN', description: 'Administrative operations', createdBy: admin._id }
        ]);
        console.log(`✅ ${depts.length} departments created`);

        // Create HODs (Department Authorities)
        const hod1 = await User.create({
            name: 'Dr. Priya Sharma',
            email: 'hod.rnd@ipr.gov.in',
            password: await bcrypt.hash('Hod@123', 12),
            role: 'hod',
            department: depts[0]._id,
            isActive: true,
            isApproved: true,
            employeeId: 'IPR-HOD-001'
        });

        const hod2 = await User.create({
            name: 'Mr. Amit Patel',
            email: 'hod.hr@ipr.gov.in',
            password: await bcrypt.hash('Hod@123', 12),
            role: 'hod',
            department: depts[1]._id,
            isActive: true,
            isApproved: true,
            employeeId: 'IPR-HOD-002'
        });

        const hod3 = await User.create({
            name: 'Ms. Kavitha Reddy',
            email: 'hod.it@ipr.gov.in',
            password: await bcrypt.hash('Hod@123', 12),
            role: 'hod',
            department: depts[3]._id,
            isActive: true,
            isApproved: true,
            employeeId: 'IPR-HOD-003'
        });

        // Assign HODs to departments
        await Department.findByIdAndUpdate(depts[0]._id, { hod: hod1._id });
        await Department.findByIdAndUpdate(depts[1]._id, { hod: hod2._id });
        await Department.findByIdAndUpdate(depts[3]._id, { hod: hod3._id });
        console.log(`✅ 3 HODs created and assigned`);

        // Create Employees (Active - approved)
        const employees = await Promise.all([
            User.create({
                name: 'Dr. Suresh Menon',
                email: 'employee1@ipr.gov.in',
                password: await bcrypt.hash('Emp@123', 12),
                role: 'employee',
                department: depts[0]._id,
                isActive: true,
                isApproved: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                employeeId: 'IPR-EMP-001'
            }),
            User.create({
                name: 'Ms. Deepa Nair',
                email: 'employee2@ipr.gov.in',
                password: await bcrypt.hash('Emp@123', 12),
                role: 'employee',
                department: depts[1]._id,
                isActive: true,
                isApproved: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                employeeId: 'IPR-EMP-002'
            }),
            User.create({
                name: 'Mr. Vikram Singh',
                email: 'employee3@ipr.gov.in',
                password: await bcrypt.hash('Emp@123', 12),
                role: 'employee',
                department: depts[3]._id,
                isActive: true,
                isApproved: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                employeeId: 'IPR-EMP-003'
            })
        ]);
        console.log(`✅ ${employees.length} employees created (approved)`);

        // Create Pending Employees (awaiting admin approval)
        await User.create({
            name: 'Mr. Arun Kumar',
            email: 'pending1@ipr.gov.in',
            password: await bcrypt.hash('Emp@123', 12),
            role: 'employee',
            department: depts[0]._id,
            isActive: false,
            isApproved: false
        });
        await User.create({
            name: 'Ms. Sunita Rao',
            email: 'pending2@ipr.gov.in',
            password: await bcrypt.hash('Emp@123', 12),
            role: 'employee',
            department: depts[1]._id,
            isActive: false,
            isApproved: false
        });
        console.log(`✅ 2 pending employee registrations created`);

        // Initialize Blockchain with Genesis Block
        await BlockchainService.getGenesisBlock();
        console.log('✅ Genesis block created');

        // Register admin and HODs on blockchain
        await BlockchainService.registerUser(admin._id, admin.name, admin.role, admin.email);
        await BlockchainService.registerUser(hod1._id, hod1.name, hod1.role, hod1.email);
        await BlockchainService.registerUser(hod2._id, hod2.name, hod2.role, hod2.email);
        await BlockchainService.registerUser(hod3._id, hod3.name, hod3.role, hod3.email);
        console.log('✅ Users registered on blockchain');

        console.log('\n===========================================');
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY');
        console.log('===========================================');
        console.log('\n📋 LOGIN CREDENTIALS:');
        console.log('┌─────────────────────────────────────────┐');
        console.log('│ ADMIN:    admin@ipr.gov.in  / Admin@123  │');
        console.log('│ HOD(RnD): hod.rnd@ipr.gov.in / Hod@123  │');
        console.log('│ HOD(HR):  hod.hr@ipr.gov.in  / Hod@123  │');
        console.log('│ HOD(IT):  hod.it@ipr.gov.in  / Hod@123  │');
        console.log('│ Employee: employee1@ipr.gov.in / Emp@123 │');
        console.log('│ Employee: employee2@ipr.gov.in / Emp@123 │');
        console.log('│ Employee: employee3@ipr.gov.in / Emp@123 │');
        console.log('└─────────────────────────────────────────┘');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seed();
