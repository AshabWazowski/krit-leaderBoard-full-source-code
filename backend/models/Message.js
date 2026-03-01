const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    content: { type: String, required: true },
}, { timestamps: true });

messageSchema.index({ createdAt: 1 }); // Index for sorting chat history

module.exports = mongoose.model('Message', messageSchema);
