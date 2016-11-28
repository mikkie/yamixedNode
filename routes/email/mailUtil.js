var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    "host": "smtpdm.aliyun.com",
    "port": 465,
    "secureConnection": true, // use SSL
    "auth": {
        "user": 'webmaster@notice.yamixed.com', // user name
        "pass": 'Kis212SsAVfmo88nnnM'         // password
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Yamixed<webmaster@notice.yamixed.com>', // sender address mailfrom must be same with the user
};


var sendMail = function(to,subject,text,html){
    mailOptions.to = to;
    mailOptions.subject = subject;
    mailOptions.text = text;
    mailOptions.html = html;
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);

    });
};

exports.sendMail = sendMail;


