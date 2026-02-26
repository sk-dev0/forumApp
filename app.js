const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const { isLoggedIn, isThreadAuthor, isThreadExist, isPostAuthor, isPostExist, validateThread, validatePost} = require('./middleware');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

const Thread = require('./models/thread');
const Post = require('./models/post');
const User = require('./models/user');

const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized:false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res ,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

mongoose.connect('mongodb://127.0.0.1:27017/forumApp')
    .then(() => {
        console.log('MongoDB Connected');
    })
    .catch(err => {
        console.log('Connection failed');
        console.log(err);
    });


app.get('/', (req, res) => {
    res.render('home');
})

app.post('/threads', isLoggedIn, validateThread, catchAsync(async (req, res) => {
    const thread = new Thread(req.body);
    thread.author = req.user._id;
    await thread.save();
    res.redirect('/threads');
}));

app.get('/threads', catchAsync(async (req, res) => {
    const threads = await Thread.find({});
    res.render('threads/index', { threads });
}));

app.get('/threads/new', isLoggedIn,  (req, res) => {
    res.render('threads/new')
});

app.get('/threads/:id', catchAsync(async (req, res) => {
    const threadId = req.params.id;
    const thread = await Thread.findById(req.params.id);
    const posts = await Post.find({ thread: threadId }).sort({ createdAt: 1 });
    res.render('threads/show', { thread, posts });
}));

app.delete('/threads/:id', isLoggedIn, isThreadExist, isThreadAuthor, catchAsync(async (req, res) => {
    await Post.deleteMany({ thread: req.thread._id });
    await req.thread.deleteOne();

    req.flash('success', 'スレッドを削除しました');
    res.redirect('/threads');
}));

app.get('/threads/:id/edit', isLoggedIn, isThreadExist, isThreadAuthor, catchAsync(async(req, res) => {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const isWithinTime = (Date.now() - req.thread.createdAt.getTime()) < FIVE_MINUTES;

    if (!isWithinTime) { 
        req.flash('error', 'スレッドは作成から5分以内のみ編集可能です');
        return res.redirect('/threads');
    }

    res.render('threads/edit', { thread: req.thread });
}));

app.put('/threads/:id', isLoggedIn, isThreadExist, isThreadAuthor, validateThread, catchAsync(async (req, res) => {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const isWithinTime = (Date.now() - req.thread.createdAt.getTime()) < FIVE_MINUTES;

    if (!isWithinTime) { 
        req.flash('error', 'スレッドは作成から5分以内のみ編集可能です');
        return res.redirect('/threads');
    }

    req.thread.title = req.body.title;
    req.thread.content = req.body.content;
    await req.thread.save();

    req.flash('success', 'スレッドを更新しました');
    res.redirect('/threads');
}));

app.post('/threads/:id/posts', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    await Post.create({
        content,
        thread: id,
        author: req.user._id
    });
    res.redirect(`/threads/${id}`);
}));

app.put('/posts/:id', isLoggedIn, isPostExist, isPostAuthor, validatePost, catchAsync(async (req, res) => {
    req.post.content = req.body.content;
    req.post.edited = true;
    req.post.editedAt = Date.now();
    await req.post.save();
    req.flash('success', '投稿を更新しました');
    res.redirect(`/threads/${req.post.thread}`);
}));

app.delete('/posts/:id', isLoggedIn, isPostExist, isPostAuthor, catchAsync(async (req, res) => {
    await req.post.deleteOne();
    req.flash('success', '投稿を削除しました');
    res.redirect(`/threads/${req.post.thread}`);
}));

app.get('/register', (req, res) => {
    res.render('users/register');
});

app.post('/register', catchAsync(async (req, res, next) => {
    try{
        const { username, password } = req.body;
        const user = new User({ username });

        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            res.redirect('/threads');
        });
    } catch (e) {
        res.redirect('/register');
    }
}));

app.get('/login', (req, res) => {
    res.render('users/login');
})

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'ユーザー名またはパスワードが違います',
    }),
    (req, res) => {
        req.flash('success', 'おかえりなさい！！');
        res.redirect('/threads');
    }
);


app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) {
            req.flash('error', 'ログアウトに失敗しました');
            return next(err);
        }
        req.flash('success', 'ログアウトしました');
        res.redirect('/threads');
    })
})

app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) =>{
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});