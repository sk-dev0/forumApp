const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Thread = require('../models/thread');
const Post = require('../models/post');
const { isLoggedIn, isThreadAuthor, isThreadExist, validateThread, normalizeTags, validatePost } = require('../middleware');

const tagCategories = {
    '情報・知識': ['ニュース・時事', '政治・社会', '科学・技術', '歴史・文化'],
    '趣味・娯楽': ['スポーツ', 'ゲーム', '音楽', '映画・アニメ', '読書・漫画'],
    'ライフスタイル': ['グルメ・料理', '旅行', 'ファッション', '健康・美容'],
    'コミュニティ': ['雑談', '質問', '相談', '議論・ディベート'],
};

router.get('/', catchAsync(async (req, res) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const filter = { createdAt: { $gte: oneMonthAgo } };

    if (req.query.tag) {
        filter.tags = req.query.tag;
    }

    if (typeof req.query.keyword === 'string' && req.query.keyword) {
        const specialChars = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\'];

        const keyword = [];
        for (const char of req.query.keyword) {
            if (specialChars.includes(char)) {
                keyword.push('\\')
            }
            keyword.push(char);
        }
        
        filter.title = { $regex: keyword.join(''), $options: 'i' };
    }

    let page = parseInt(req.query.page) || 1;
    if (page < 0) {
        page = 1;
    }
    const limit = 20;
    const skip = (page - 1) * limit;

    const totalThreads = await Thread.countDocuments(filter);
    const totalPages = Math.ceil(totalThreads / limit);

    const threads = await Thread.find(filter).populate('author').sort({ createdAt: -1 }).skip(skip).limit(limit);

    const threadsWithCount = await Promise.all(threads.map(async thread => {
        const postCount = await Post.countDocuments({ thread: thread._id });
        thread.postCount = postCount;
        return thread;
    }));

    res.render('threads/index', { 
        threads: threadsWithCount, 
        currentTag: req.query.tag, 
        currentKeyword: req.query.keyword, 
        tagCategories,
        currentPage: page,
        totalPages
    });
}));

router.get('/new', isLoggedIn,  (req, res) => {
    res.render('threads/new', { tagCategories });
});

router.post('/', isLoggedIn, normalizeTags, validateThread, catchAsync(async (req, res) => {
    const thread = new Thread(req.body);
    thread.author = req.user._id;
    await thread.save();
    res.redirect('/threads');
}));

router.get('/:id', isThreadExist, catchAsync(async (req, res) => {
    const posts = await Post.find({ thread: req.thread._id }).populate('author').sort({ createdAt: 1 });
    res.render('threads/show', { thread: req.thread, posts });
}));

router.delete('/:id', isLoggedIn, isThreadExist, isThreadAuthor, catchAsync(async (req, res) => {
    await Post.deleteMany({ thread: req.thread._id });
    await req.thread.deleteOne();

    req.flash('success', 'スレッドを削除しました');
    res.redirect('/threads');
}));

router.get('/:id/edit', isLoggedIn, isThreadExist, isThreadAuthor, catchAsync(async(req, res) => {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const isWithinTime = (Date.now() - req.thread.createdAt.getTime()) < FIVE_MINUTES;

    if (!isWithinTime) { 
        req.flash('error', 'スレッドは作成から5分以内のみ編集可能です');
        return res.redirect('/threads');
    }

    res.render('threads/edit', { thread: req.thread, tagCategories });
}));

router.put('/:id', isLoggedIn, isThreadExist, isThreadAuthor, normalizeTags, validateThread, catchAsync(async (req, res) => {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const isWithinTime = (Date.now() - req.thread.createdAt.getTime()) < FIVE_MINUTES;

    if (!isWithinTime) { 
        req.flash('error', 'スレッドは作成から5分以内のみ編集可能です');
        return res.redirect('/threads');
    }

    req.thread.title = req.body.title;
    req.thread.content = req.body.content;
    req.thread.tags = req.body.tags;
    await req.thread.save();

    req.flash('success', 'スレッドを更新しました');
    res.redirect('/threads');
}));

router.post('/:id/posts', isLoggedIn, isThreadExist, validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const postCount = await Post.countDocuments({ thread: id });
    if (postCount >= 500) {
        req.flash('error', 'このスレッドは書き込み上限に達しました');
        return res.redirect(`/threads/${id}`);
    }

    await Post.create({
        content,
        thread: id,
        author: req.user._id
    });
    res.redirect(`/threads/${id}`);
}));

module.exports = router;