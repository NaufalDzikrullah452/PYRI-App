const CryptoJS = require("crypto-js");

// Encrypt
const encrypt = (val) => { return CryptoJS.AES.encrypt(val, 'secret key 123').toString() };

// Decrypt
const decrypt = (val) => {
    var bytes  = CryptoJS.AES.decrypt(val, 'secret key 123');
    return bytes.toString(CryptoJS.enc.Utf8);
}

export const ext = {
    encrypt, decrypt
}