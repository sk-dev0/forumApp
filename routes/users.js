const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { validateUser } = require('../middleware');

router.get('/register', (req, res) => {
    if (req.user) {
        return res.redirect('/threads');
    }
    res.render('users/register');
})

router.post('/register', validateUser, catchAsync(async (req, res, next) => {
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
        if (e.name === 'UserExistsError') {
            req.flash('error', e.message);
        } else {
            req.flash('error', '登録に失敗しました')
        }
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/threads');
    }
    res.render('users/login');
})

router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'ユーザー名またはパスワードが違います',
    }),
    (req, res) => {
        req.flash('success', 'おかえりなさい！！');
        res.redirect('/threads');
    }
);


router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) {
            req.flash('error', 'ログアウトに失敗しました');
            return next(err);
        }
        req.flash('success', 'ログアウトしました');
        res.redirect('/threads');
    })
})

module.exports = router;