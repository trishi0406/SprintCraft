const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#3B82F6', '#F97316'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, 'Please provide a valid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: null },
    activeStatus: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.virtual('initials').get(function () {
  const parts = (this.name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'US';
  return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
});

userSchema.virtual('color').get(function () {
  const hex = String(this._id || '').slice(-4);
  const n = parseInt(hex, 16) || 0;
  return COLORS[n % COLORS.length];
});

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
