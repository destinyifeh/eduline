const express = require('express');
const nodemailer = require('nodemailer');
const env = require('dotenv');
const router = express.Router();
env.config({path: '../.env'});

require('../models/User');






router.post('/contact', async(req, res)=>{
    try{
   
     let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls:{
            rejectUnauthorized: false,
        },
        auth:{
         user: process.env.GMAIL_EMAIL,
         pass:process.env.GMAIL_PASS
        },
    });

     var mailOptions={
                   from: req.body.email,
                   to: process.env.GMAIL_EMAIL,
                   replyTo: req.body.email,
                   subject: 'Message from' +' '+ req.body.name,
                   text: req.body.messageBody,
          };
       
         transporter.sendMail(mailOptions, function(err, info){
           if(err){
               console.log(err)
               req.flash('error_msg', 'Message not sent, try again')
               return res.redirect('back')
           }else{
               console.log('Message sent successfully' + info.response)
               req.flash('success_msg', 'Message delivered successfully')
               res.redirect('back')
           }
       })
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500');
    }
});




module.exports = router;