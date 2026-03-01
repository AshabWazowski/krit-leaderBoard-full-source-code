const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pointsMap: {
        type: Map,
        of: Number,
        default: {}
    } // Maps UserId to Points in this specific group
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
