module.exports = function(app) {

    "use strict";
    const nodemailer = require("nodemailer");

    // async..await is not allowed in global scope, must use a wrapper
    async function sendMail() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'twila34@ethereal.email',
                pass: 'E5gp7DtPFnqXZ21uCc'
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"EcoMeetup Admin" <admin@ecomeetup.com>', // sender address
            to: "ong.osmond@gmail.com", // list of receivers
            subject: "A person joined your event", // Subject line
            text: "A person joined your event", // plain text body
            html: "<b>A person joined your event</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    //sendMail().catch(console.error);

}