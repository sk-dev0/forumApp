const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
    title: String,
    content: String,
    tags: [{ type: String, trim: true }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
    },
}, { timestamps: true });

module.exports = mongoose.model('Thread', threadSchema);
