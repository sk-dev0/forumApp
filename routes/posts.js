const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Post = require('../models/post');
const { isLoggedIn, isPostAuthor, isPostExist, validatePost } = require('../middleware');

router.put('/:id', isLoggedIn, isPostExist, isPostAuthor, validatePost, catchAsync(async (req, res) => {
    req.post.content = req.body.content;
    req.post.edited = true;
    req.post.editedAt = Date.now();
    await req.post.save();
    req.flash('success', '投稿を更新しました');
    res.redirect(`/threads/${req.post.thread}`);
}));

router.delete('/:id', isLoggedIn, isPostExist, isPostAuthor, catchAsync(async (req, res) => {
    await req.post.deleteOne();
    req.flash('success', '投稿を削除しました');
    res.redirect(`/threads/${req.post.thread}`);
}));

module.exports = router;