const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': 'HTMLタグは使用できません'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.threadSchema = Joi.object({
    title: Joi.string().required().max(100).escapeHTML().messages({
        'string.empty': 'タイトルは必須です',
        'any.required': 'タイトルは必須です',
        'string.max': 'タイトルは100文字以内にしてください',
        'string.escapeHTML': 'タイトルにHTMLタグは使用できません'
    }),
    content: Joi.string().required().max(500).escapeHTML().messages({
        'string.empty': '本文は必須です',
        'any.required': '本文は必須です',
        'string.max': '本文は500文字以内にしてください',
        'string.escapeHTML': '本文にHTMLタグは使用できません'
    }),
    tags: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.min': 'タグを1つ以上選択してください',
        'any.required': 'タグを1つ以上選択してください'
    })
});

module.exports.postSchema = Joi.object({
    content: Joi.string().required().max(500).escapeHTML().messages({
        'string.empty': '投稿内容は必須です',
        'any.required': '投稿内容は必須です',
        'string.max': '投稿内容は500文字以内にしてください',
        'string.escapeHTML': '投稿内容にHTMLタグは使用できません'
    })
});

module.exports.userSchema = Joi.object({
    username: Joi.string().min(3).max(20).pattern(/^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/).required().messages({
    'string.empty': 'ユーザー名は必須です',
    'string.pattern.base': 'ユーザー名は半角英数字・ひらがな・カタカナ・漢字のみ使用できます',
    'string.min': 'ユーザー名は3文字以上にしてください',
    'string.max': 'ユーザー名は20文字以内にしてください',
    'any.required': 'ユーザー名は必須です'
    }),
    password: Joi.string().min(8).pattern(/^[a-zA-Z0-9!@#$%^&*]+$/).required().messages({
        'string.empty': 'パスワードは必須です',
        'string.min': 'パスワードは8文字以上にしてください',
        'string.pattern.base': 'パスワードは半角英数字と記号(!@#$%^&*)のみ使用できます',
        'any.required': 'パスワードは必須です'
    })
});