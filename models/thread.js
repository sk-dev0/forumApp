const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
    title: String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
    },
});

module.exports = mongoose.model('Thread', threadSchema);
