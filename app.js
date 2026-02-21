const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate');
const mongoose = require('mongoose');

const Thread = require('./models/thread');

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

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
    console.log(req.body);
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
    res.render('threads/show', { thread });
});

app.use((req, res) => {
    res.send('そんなパスはありません');
});

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});