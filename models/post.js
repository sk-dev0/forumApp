const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: String,
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
});

module.exports = mongoose.model('Post', postSchema);