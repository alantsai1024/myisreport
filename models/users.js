const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
    _id: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true
    },
    verifyemail: {
        type: Boolean,
        default: false
    },
    registerExpire: {
        type: Date
    },
    verifycode: {
        type: String
    },
    loginExpire: {
        type: Date
    },
    VertifyCodeBoolean: {
        type: Boolean,
        default: false
    },
    publicKey: {
        type: String,
        require: true
    },
    privateKey: {
        type: String,
        require: true
    },
})

const User = mongoose.model('User', userschema)

module.exports = User