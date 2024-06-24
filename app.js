/*
主題:創立具OTP和公私鑰的登入網站
課程:資訊安全導論
指導老師: 梅興老師
系別:智慧資安
作者:蔡宇倫
學號:412580084
*/
const express = require('express')
const app = express()
const session = require('express-session')
const ip = '192.168.0.23'
const port = 5555




//引進環境變數
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

//設定session
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

//引進cookie
const cookieParser = require('cookie-parser')
app.use(cookieParser())

//引進資料庫(MongoDB)
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL)
const db = mongoose.connection
db.on('error', () => {
    console.log('資料庫連線失敗...');
})
db.once('open', () => {
    console.log('數據庫連接成功！');
})

//自動清理未啟用信箱且過期的用戶以及將已經cookie過期的用戶VertifyCodeBoolean定為false(每分鐘檢查一次)
const schedule = require('node-schedule')
const User = require('./models/users')
schedule.scheduleJob('* * * * *', async () => {
    const users = await User.find({ verifyemail: false })
    const usersforlogin = await User.find({ VertifyCodeBoolean: true })
    users.forEach(async user => {
        if (Date.now() - user.registerExpire >= 0) {
            await User.deleteOne({ _id: user._id })
        }
    })
    usersforlogin.forEach(async user => {
        if (Date.now() - user.loginExpire >= 1000 * 60 * 55) {
            await User.updateOne({ _id: user._id }, { VertifyCodeBoolean: false })
        }
    })
})

app.set('view engine', 'hbs')//設定handlebars為模板引擎
app.use(express.urlencoded({ extended: false }))//解析表單數據

//靜態資源開放的資料夾
app.use(express.static('public'))
app.use('/', express.static('public'))
app.use('/auth', express.static('public'))

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    res.set('Expires', 0)
    next()
})

//設定路由
app.use('/', require('./routes/router'))
app.use('/auth', require('./routes/auth'))

app.listen(port, () => {
    console.log(`服務運行在：http://localhost:${port}`);
})
