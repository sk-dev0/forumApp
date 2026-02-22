const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: String,
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);