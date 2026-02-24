const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const isLoggedIn = require('./middleware').isLoggedIn;

const Thread = require('./models/thread');
const Post = require('./models/post');

const bcrypt = require('bcrypt');
const User = require('./models/user');
const methodOverride = require('method-override');
const thread = require('./models/thread');

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'));

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

app.post('/threads', isLoggedIn, async (req, res) => {
    const thread = new Thread(req.body);
    thread.author = req.user._id;
    await thread.save();
    res.redirect('/threads');
})

app.get('/threads', async (req, res) => {
    const threads = await Thread.find({});
    res.render('threads/index', { threads });
});

app.get('/threads/new', (req, res) => {
    res.render('threads/new')
});

app.get('/threads/:id', async (req, res) => {
    const threadId = req.params.id;
    const thread = await Thread.findById(req.params.id);
    const posts = await Post.find({ thread: threadId }).sort({ createdAt: 1 });
    res.render('threads/show', { thread, posts });
});

app.delete('/threads/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const thread = await Thread.findById(id);

    if (!thread) {
        req.flash('error', 'スレッドが見つかりません');
        return res.redirect('/threads');
    }

    if (!thread.author.equals(req.user._id)) {
        req.flash('error', '権限がありません');
        return res.redirect('/threads');
    }

    await Post.deleteMany({ thread: id });
    await Thread.findByIdAndDelete(id);

    req.flash('success', 'スレッドを削除しました');
    res.redirect('/threads');
});

app.post('/threads/:id/posts', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    await Post.create({
        content,
        thread: id,
        author: req.user._id
    });
    res.redirect(`/threads/${id}`);
});

app.put('/posts/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post.author.equals(req.user._id)){
        req.flash('error', '権限がありません');
        return res.redirect(`/threads/${post.thread}`);
    }

    post.content = req.body.content;
    post.edited = true;
    post.editedAt = Date.now();
    await post.save();
    req.flash('success', '投稿を更新しました');
    res.redirect(`/threads/${post.thread}`);
});

app.delete('/posts/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post.author.equals(req.user._id)){
        req.flash('error', '権限がありません');
        return res.redirect(`/threads/${post.thread}`);
    }

    await Post.findByIdAndDelete(id);
    req.flash('success', '投稿を削除しました');
    res.redirect(`/threads/${post.thread}`);
});

app.get('/register', (req, res) => {
    res.render('users/register');
});

app.post('/register', async (req, res, next) => {
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
});

app.get('/login', (req, res) => {
    res.render('users/login');
})

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
    }),
    (req, res) => {
        req.flash('success', 'おかえりなさい！！');
        res.redirect('/threads');
    }
);


app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'ログアウトしました');
        res.redirect('/threads');
    })
})

app.use((req, res) => {
    res.send('そんなパスはありません');
});

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});