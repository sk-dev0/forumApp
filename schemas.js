const Joi = require('joi');

module.exports.threadSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'タイトルは必須です',
        'any.required': 'タイトルは必須です',
        'string.max': 'タイトルは100文字以内にしてください'
    }),
    content: Joi.string().required().messages({
        'string.empty': '本文は必須です',
        'any.required': '本文は必須です',
        'string.max': '本文は500文字以内にしてください'
    })
});

module.exports.postSchema = Joi.object({
    content: Joi.string().required().messages({
        'string.empty': '投稿内容は必須です',
        'any.required': '投稿内容は必須です',
        'string.max': '投稿内容は500文字以内にしてください'
    })
});