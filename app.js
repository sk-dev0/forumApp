const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate');
const mongoose = require('mongoose');

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

let threads = []; //テスト用配列

app.get('/', (req, res) => {
    res.render('home');
})

app.post('/threads', (req, res) => {
    threads.push(req.body);
    res.redirect('/threads');
})

app.get('/threads', (req, res) => {
    res.render('threads/index', { threads });
});

app.get('/threads/new', (req, res) => {
    res.render('threads/new')
})

app.use((req, res) => {
    res.send('そんなパスはありません');
});

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});