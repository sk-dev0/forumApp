const ExpressError = require('./utils/ExpressError');
const { threadSchema, postSchema } = require('./schemas');
const Thread = require('./models/thread');
const Post = require('./models/post');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){
        req.flash('error', 'ログインしてください');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateThread = (req, res, next) => {
    const { error } = threadSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message || '入力内容に誤りがあります').join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isThreadExist = async (req, res,next) => {
    const { id } = req.params;
    const thread = await Thread.findById(id);
    if (!thread) {
        req.flash('error', 'スレッドが見つかりません');
        return res.redirect('/threads');
    }
    req.thread = thread;
    next();
}

module.exports.isThreadAuthor = async(req, res, next) => {
    if (!req.thread.author.equals(req.user._id)) {
        req.flash('error', '権限がありません');
        return res.redirect('/threads');
    }
    next();
}

module.exports.validatePost = (req, res, next) => {
    const { error } = postSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message || '入力内容に誤りがあります').join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isPostExist = async(req, res, next) =>{
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
        req.flash('error', '投稿が見つかりません');
        return res.redirect(`/threads/${post.thread}`);
    }
    req.post = post;
    next();
}

module.exports.isPostAuthor = async(req, res, next) =>{
    if (!req.post.author.equals(req.user._id)){
        req.flash('error', '権限がありません');
        return res.redirect(`/threads/${req.post.thread}`);
    }
    next();
}