const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose').default;

const userSchema = new mongoose.Schema({});

userSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        UserExistsError: 'そのユーザー名はすでに使われています',
        MissingPasswordError: 'パスワードを入力してください',
        AttemptTooSoonError: 'アカウントがロックされています。時間をあけて再度試してください',
        TooManyAttemptsError: 'ログインの失敗が続いたため、アカウントをロックしました',
        NoSaltValueStoredError: '認証ができませんでした',
        IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています',
        IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています',
    }
});

module.exports = mongoose.model('User', userSchema);
