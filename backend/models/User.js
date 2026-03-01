const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['Admin', 'Player'], default: 'Player', index: true },
    totalPoints: { type: Number, default: 0 },
    notifications: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
