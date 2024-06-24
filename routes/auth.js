//控制發送請求的路由
const express = require('express')
const router = express.Router()
const controllers = require('../auth/auth')
const rateLimit = require("express-rate-limit");

//限制req次數
const verifyPhoneLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: '嘗試太多次，請一小時後再試。'
});

router.post('/register', verifyPhoneLimiter, controllers.register)
router.post('/login', verifyPhoneLimiter, controllers.login)

router.post('/verifycode', verifyPhoneLimiter, controllers.verifyCodesubmit)

router.get('/logout', controllers.logout)







module.exports = router