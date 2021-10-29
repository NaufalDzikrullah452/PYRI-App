var nodemailer = require('nodemailer');
import fs from 'fs'
import path from 'path'

const CryptoJS = require("crypto-js");

// Encrypt
const encrypto = (val) => { return CryptoJS.AES.encrypt(val, 'secret key 123').toString() };

// Decrypt
const decrypto = (val) => {
    var bytes = CryptoJS.AES.decrypt(val, 'secret key 123');
    return bytes.toString(CryptoJS.enc.Utf8);
}


const { pipeline } = require('stream')
const util = require('util')
const pump = util.promisify(pipeline)

const sendVerifCode = (email, value) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pyri.app@gmail.com', // fill your mail
            pass: 'pyriapptim1' // fill your password
        }
    });

    var mailOptions = {
        from: 'pyri.app@gmail.com', // fill your mail
        to: email,
        subject: 'Verification code PYRI-APP',
        text: 'Your Verification code : ' + value
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false;
        } else {
            console.log('Email sent: ' + info.response);
            return true;
        }
    });
}
export const ext = { sendVerifCode, encrypto, decrypto, pump, fs, path }
