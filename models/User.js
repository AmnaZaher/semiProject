
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, hashed: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  firstName: { type: String, optional: true },
  lastName: { type: String, optional: true },
  phoneNumber: { type: String, optional: true },
  address: { type: String, optional: true },
  passwordResetToken: { type: String, default: null },
  passwordResetTokenExpiry: { type: Date, default: null },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);