const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/.+@.+\..+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return the password field by default
  },
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 } // For streak badges
  },
  badges: [{
    name: String,
    icon: String,
    acquiredAt: { type: Date, default: Date.now }
  }],
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);