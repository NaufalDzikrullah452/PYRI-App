var nodemailer = require('nodemailer');

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
export const ext = { sendVerifCode }
