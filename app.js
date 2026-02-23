const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');

const Thread = require('./models/thread');
const Post = require('./models/post');

const bcrypt = require('bcrypt');
const User = require('./models/user');

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
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

app.post('/threads', async (req, res) => {
    const thread = new Thread(req.body);
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

app.post('/threads/:id/posts', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    await Post.create({
        content,
        thread: id
    });
    res.redirect(`/threads/${id}`);
});

app.get('/register', (req, res) => {
    res.render('users/register');
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password: hashedPassword
    });
    await user.save();
    res.redirect('/threads');
})

app.get('/login', (req, res) => {
    res.render('users/login');
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.send('ユーザーが存在しません');
    } 
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.send('パスワードが違います');
    }

    req.session.userId = user._id;
    res.redirect('/threads');
});

app.use((req, res) => {
    res.send('そんなパスはありません');
});

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});