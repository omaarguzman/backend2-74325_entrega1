const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name:  { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  age:        { type: Number, default: 0 },
  password:   { type: String, required: true }, // se almacenará en hash
  cart:       { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role:       { type: String, default: 'user', enum: ['user','admin'] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;