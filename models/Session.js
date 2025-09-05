const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  username: { type: String, required: true },
  token: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now, expires: '1h' }
});

module.exports = mongoose.model("Session", sessionSchema);
