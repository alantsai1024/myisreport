//經由請求發送路由分發後，再去做相應處理(處理請求的程式)

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/users');
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const dotenv = require('dotenv')
dotenv.config({ path: '../config.env' })
const mongoose = require('mongoose')
const session = require('express-session');



/**
 * @desc 產生驗證碼
 * @returns {String} 產生驗證碼
**/
function generateVerifyCode() {
    return crypto.randomBytes(256).toString('base64').substring(0, 5)
}

/**
 * @desc 產生RSA金鑰對
 * @returns {Object} 產生RSA金鑰對
 */

function generatepairkey() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,//單位是bit，換成byte要除以8
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    })
}

/**
* @desc 註冊 
* @route POST /register
**/
exports.register = async (req, res) => {

    const { username, email, password, passwordconfirm } = req.body;

    if (!username || !email || !password || !passwordconfirm) {
        return res.status(400).render('register', { message: '請填寫所有欄位' });
    } else if (password !== passwordconfirm) {
        return res.status(400).render('register', { message: '密碼不一致' });
    } else if (password.length < 6) {
        return res.status(400).render('register', { message: '密碼長度至少6位' });
    } else {
        const hasregister = await User.findOne({ email: email });
        if (hasregister) {
            return res.status(400).render('register', { message: '此信箱已經註冊過' });
        } else {
            const { publicKey, privateKey } = generatepairkey()
            const hashpassword = await bcrypt.hash(password, 10);
            const newuser = new User({
                _id: new mongoose.Types.ObjectId(),
                name: username,
                email,
                password: hashpassword,
                registerExpire: Date.now() + 1000 * 60 * 5,
                publicKey,
                privateKey
            })
            await newuser.save();

            const sendVertifyMail = async (name, email, userid) => {
                try {
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        auth: {
                            user: process.env.EMAIL_ADMIN,
                            pass: process.env.EMAIL_PASS
                        },
                    })

                    const mailOptions = {
                        from: process.env.EMAIL_ADMIN,
                        to: email,
                        subject: '註冊驗證信',
                        html: '<h2>尊敬的' + name + '您好，恭喜您已成功註冊，請點擊此<a href="https://myisreport.onrender.com/vertifyemail?id=' + userid + '">連結</a>完成驗證來啟用帳號，若不是您本人請不要點擊此連結，此外若未完成啟用帳號，服務器將在5分鐘後註銷該帳號。</h2>'
                    }

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error);
                        }
                        console.log(email + '的啟用信箱信已寄出');
                    })
                }
                catch (error) {
                    console.log(error);
                }
            }
            const updateuser = await User.findOne({ email: email });

            sendVertifyMail(updateuser.name, updateuser.email, updateuser._id);

            return res.status(201).render('login', {
                registersuccess: `註冊成功！<br>請從信箱啟用帳號才能登入，若無啟用系統將在約5分鐘後進行註銷`
            });
        }
    }
}

//啟用信箱
exports.vertifyMail = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.findById(id) || 0;
        if (!user) {
            return res.status(404).send('找不到此帳號');
        } else if (Date.now() > user.registerExpire && user.verifyemail === false || user === 0) {
            await User.deleteOne({ _id: id });
            return res.status(400).render('verifyerror');
        } else {
            await User.updateOne({ _id: id }, { $set: { verifyemail: true } });
            res.status(200).render('verifyemail');
        }

    } catch (error) {
        console.log(error);
    }
}


//登入(jwt簽章後發送驗證碼至信箱)
exports.login = async (req, res) => {
    const { email, password } = req.body;



    if (!email || !password) {
        return res.status(400).render('login', { message: '請填寫所有欄位' });
    } else {
        const user = await User.findOne({ email: email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).render('login', { message: '信箱或密碼錯誤' });
        } else if (user.verifyemail === false) {
            return res.status(401).render('login', { message: '請先啟用信箱' });
        } else {
            const verifycode = generateVerifyCode();
            const payload = {
                name: user.name,
                email: user.email,
                expiretime: Date.now() + 1000 * 60 * 60,
                issuer: process.env.ISSUER,

            };
            const privateKey = user.privateKey
            const token = jwt.sign({ payload: payload }, privateKey, { algorithm: 'RS256' });
            res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 60 })

            await User.updateOne({ email: email }, { $set: { verifycode: verifycode, loginExpire: Date.now() + 5 * 60 * 1000, VertifyCodeBoolean: false } });

            req.session.email = user.email;

            const sendVerifyCodeMail = async (name, email, verifycode) => {
                try {
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        auth: {
                            user: process.env.EMAIL_ADMIN,
                            pass: process.env.EMAIL_PASS
                        },
                    })

                    const mailOptions = {
                        from: process.env.EMAIL_ADMIN,
                        to: email,
                        subject: '登入驗證碼',
                        html: '<h2>尊敬的' + name + '您好，您的驗證碼為' + verifycode + '，此驗證碼將在5分鐘後失效，請儘快使用。</h2>'
                    }

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error);
                        }
                        console.log(email + '的驗證信已寄出');
                    })
                }
                catch (error) {
                    console.log(error);
                }
            }
            const updateuser = await User.findOne({ email: email });
            await sendVerifyCodeMail(updateuser.name, updateuser.email, updateuser.verifycode);
            return res.status(200).redirect('/verifycode')
        }
    }
}

//訪問驗證碼頁面(驗證jwt簽章)
exports.verifyCode = async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).redirect('/login');
    } else {
        const email = req.session.email;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).redirect('/login');
        } else {
            /*測試製作假token，是否可以透過假token進行登入
            const faketoken = jwt.decode(token);
            const fakepayload = {
                name: user.name,
                email: user.email,
                expiretime: Date.now() + 1000 * 60 * 60000,
                issuer: '偽造者'
            }
            const fakeemail = 'lun931024@gmail.com'
            const fakeuser = await User.findOne({ email: fakeemail });
            const faketoken2 = jwt.sign({ payload: fakepayload }, fakeuser.privateKey, { algorithm: 'RS256' });
            const faketoken3 = faketoken2.replace(faketoken2.split('.')[1], Buffer.from(JSON.stringify(fakepayload)).toString('base64'));
            */

            jwt.verify(token, user.publicKey, { algorithms: ['RS256'] }, (err, decodedtoken) => {
                if (err) {
                    return res.status(401).redirect('/login');
                } else {
                    const verifymsg = decodedtoken.payload.email + '正準備要輸入驗證碼' + "[IP位址：" +
                        req.connection.remoteAddress.replace('::ffff:', '')
                        + "]"
                    console.log(verifymsg);
                    return res.status(200).render('verifycode');
                }
            });
        }
    }
}

//送出驗證碼並驗證
exports.verifyCodesubmit = async (req, res) => {
    const token = req.cookies.jwt;
    const { verifycode } = req.body;
    if (!token) {
        return res.status(401).redirect('/login');
    } else {
        const email = req.session.email;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).redirect('/login');
        } else {
            jwt.verify(token, user.publicKey, { algorithms: ['RS256'] }, async (err, decodedtoken) => {
                if (err) {
                    return res.status(401).redirect('/login');
                } else {
                    if (verifycode === user.verifycode && Date.now() < user.loginExpire) {
                        await User.updateOne({ email: email }, { $set: { VertifyCodeBoolean: true } });
                        const verifymsg = decodedtoken.payload.email + '驗證碼正確' + "[IP位址：" +
                            req.connection.remoteAddress.replace('::ffff:', '')
                            + "]";
                        console.log(verifymsg);
                        return res.status(200).redirect('/loginsuccess');
                    } else {
                        return res.status(401).render('verifycode', { message: '驗證碼錯誤或已過期' });
                    }
                }
            });
        }
    }
}

//訪問登入成功頁面
exports.loginsuccesspage = async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).redirect('/login');
    } else {
        const email = req.session.email;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).redirect('/login');
        } else {
            jwt.verify(token, user.publicKey, { algorithms: ['RS256'] }, (err, decodedtoken) => {
                if (err) {
                    return res.status(401).redirect('/login');
                } else {
                    if (user.VertifyCodeBoolean === false) {
                        return res.status(401).redirect('/login');
                    } else {
                        const loginmsg = decodedtoken.payload.email + '登入成功' + "[IP位址：" +
                            req.connection.remoteAddress.replace('::ffff:', '')
                            + "]"
                        console.log(loginmsg);
                        return res.status(200).render('loginsuccess', { user: decodedtoken.payload });
                    }

                }
            });
        }
    }
}

//登出(清除cookie並銷毀session)
exports.logout = async (req, res) => {
    const email = req.session.email;
    const logoutmsg = req.session.email + '登出成功' + "[IP位址：" +
        req.connection.remoteAddress.replace('::ffff:', '')
        + "]"
    await User.updateOne({ email: email }, { $set: { VertifyCodeBoolean: false } });
    console.log(logoutmsg);
    res.clearCookie('jwt');
    req.session.destroy();
    return res.status(200).redirect('/login');
}
