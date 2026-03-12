const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'hod', 'employee'], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  employeeId: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: false }, // employees need admin approval
  isApproved: { type: Boolean, default: false }, // admin approval flag
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null },
  rejectedReason: { type: String, default: null },
  blockchainAddress: { type: String, default: null }, // simulated wallet address
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never return password
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
