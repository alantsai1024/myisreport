//控制頁面的路由程序
const express = require('express')
const router = express.Router()
const controllers = require('../auth/auth')

const rateLimit = require("express-rate-limit");

//限制req次數
const verifyPhoneLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: '我們懷疑您是機器人，請稍後再試。'
});

const viewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 2000,
    message: '我們懷疑你在進行惡意操作，請稍後再試。'
});

router.get('/', viewLimiter, (req, res) => {
    return res.render('index')
})
router.get('/register', viewLimiter, (req, res) => {
    return res.render('register')
})

router.get('/login', viewLimiter, (req, res) => {
    return res.render('login')
})

router.get('/vertifyemail', verifyPhoneLimiter, controllers.vertifyMail)

router.get('/verifycode', verifyPhoneLimiter, controllers.verifyCode)

router.get('/loginsuccess', viewLimiter, controllers.loginsuccesspage)


module.exports = router