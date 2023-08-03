const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
    trim: true,
    minLength: [2, 'A name must be at least 2 characters'],
    maxLength: [30, 'A name must be at least 30 characters'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true, 'Please enter an email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please enter a valid email',
    },
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please enter a password'],
    minLength: [8, 'Please enter at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please enter a password'],
    validate: {
      validator: function (el) {
        // This only works on save or create.
        return el === this.password;
      },
      message: 'Please make sure that both passwords match',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// instance method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(String(candidatePassword), userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
