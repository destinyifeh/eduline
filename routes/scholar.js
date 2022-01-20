const express = require('express');
const Scholar = require('../models/Scholar');
const router = express.Router();
const nodemailer = require('nodemailer');
const env = require('dotenv');
const {checkUser, checkAdmin} = require('../helpers/auth');
env.config({path: '../.env'});

require('../models/Scholar');
require('../models/User');

router.get('/index', checkAdmin, async(req, res)=>{
    //pagination
   const page = parseInt(req.query.page)||1
   const limit = parseInt(req.query.limit)||100
   const count =await Scholar.countDocuments({})
   const pages = Math.ceil(count/limit)
   let nextIndex = (page+1)
   let startIndex = (page-1)
  
    if(nextIndex > pages){
       nextIndex=false;
   }
 
    let scholars = await Scholar.find({}).sort({date:-1}).skip((limit*page)-limit).limit(limit);
   res.render('scholars/index', {scholars, count, page, nextIndex, startIndex, limit, pages})
})

//scholarship application page
router.get('/new', checkUser, (req, res)=>{
    res.render('scholars/new', {title: 'Scholarship Application Page - Eduline'});
});

router.get('/success', checkUser, (req, res)=>{
    res.render('scholars/success')
});

router.get('/details', (req, res)=>{
    res.render('scholars/details', {title: 'Scholarship Application Instructions - Eduline'})
});

router.get('/jambites', (req, res)=>{
    res.render('scholars/share', {title: 'Jambites 2021 Scholarship Program For Jamb Score Of 200 And Above'})
});

router.get('/application/page', async(req, res)=>{
    try{
    
    if(req.user){
        return res.redirect('/scholarship/new')
    }else{
    res.render('scholars/guest', {title: 'Jambites 2021 Scholarship Program - Eduline'})
    }
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500');
    }
});
router.get('/application', checkUser, (req, res)=>{
    res.render('scholars/applying', {title: 'Scholarship Application - Eduline'})
});

router.get('/search', async(req, res)=>{
    try{
    let {query} = req.query;
    let q = new RegExp(query, 'i');
     //pagination
   const page = parseInt(req.query.page)||1
   const limit = parseInt(req.query.limit)||100
   const count =await Scholar.countDocuments({choice:q})
   const pages = Math.ceil(count/limit)
   let nextIndex = (page+1)
   let startIndex = (page-1)
  
    if(nextIndex > pages){
       nextIndex=false;
   }
    let searching = await Scholar.find({$or:[{choice:q}, {state:q}]}).sort({date:-1})
    .skip((limit*page)-limit).limit(limit);
     res.render('scholars/search_results', {searching, query, page, pages, limit, nextIndex, startIndex});
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500')
    }
    });

router.post('/scholar', async(req, res)=>{
    try{
     let errors = [];
     if(req.body.score == 'select'){
         errors.push({text: 'Incorrect jamb score'})
     }
     if(req.body.gender == 'select'){
        errors.push({text: 'Select gender'})
    }
     let user = await Scholar.findOne({user: req.user.username})
     if(user){
        errors.push({text: 'Hi!'+ " "+req.user.username+" "+'you already registered for this scholarship'})
         
     }
     let userEmail = await Scholar.findOne({email: req.body.email})
     if(userEmail){
         errors.push({text: 'This email already registered for this scholarship'})
     }
     let userReg = await Scholar.findOne({regNumber: req.body.regNumber})
     if(userReg){
         errors.push({text: 'This jamb registration number already registered for this scholarship'})
     }
     if(errors.length > 0){
         res.render('scholars/new', {
             errors: errors,
             firstName: req.body.firstName,
             lastName: req.body.lastName,
             email: req.body.email,
             choice: req.body.choice,
             score: req.body.score,
             regNumber: req.body.regNumber,
               account: req.body.account,
               actName: req.body.actName,
               bank: req.body.bank,
             state: req.body.state,
             gender: req.body.gender,
         })
     }else{
         const newScholar = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            choice: req.body.choice,
            score: req.body.score,
            regNumber: req.body.regNumber,
            state: req.body.state,
            account: req.body.account,
            actName: req.body.actName,
            bank: req.body.bank,
            gender: req.body.gender,
            user: req.user.username,
         }
         if(req.body.isScholar){
            newScholar.isScholar=true;
        }else{
         newScholar.isScholar=false;
        }
         console.log(newScholar);
          Scholar.create(newScholar);

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
                       from: 'Eduline <noreply.'+process.env.GMAIL_EMAIL+'>',
                       to: req.body.email,
                       
                       subject: 'Eduline Jambites 2021 Scholarship Application',
                       text: 'Your Jambite 2021 sholarship application has been received.',
              };
           
             transporter.sendMail(mailOptions, function(err, info){
               if(err){
                   console.log(err)
                   req.flash('error_msg', 'Message not sent, try again')
                  
               }else{
                   console.log('Message sent successfully' + info.response)
                   req.flash('success_msg', 'Message delivered successfully')
                   
               }
           })
          res.redirect('/scholarship/success');
     }
     
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500');
    }
});

router.get('/edit/:id', checkAdmin, async(req, res)=>{
    try{
    let scholar = await Scholar.findOne({_id: req.params.id})
     res.render('scholars/edit', {scholar});
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500')
    }
});

router.put('/scholar/:id', async(req, res)=>{
    try{
    let scholar = await Scholar.findOne({_id: req.params.id})
      if(!scholar){
         return res.redirect('back');
      }
    if(req.body.isScholar){
        scholar.isScholar=true;
    }else{
     scholar.isScholar=false;
    }
    scholar.save();
    console.log(scholar)
    req.flash('success_msg', 'Scholarship user info updated');
    res.redirect('/scholarship/index');
}
catch(err){
    console.log(err.message)
    res.redirect('/500');
}
});

router.get('/email/:id', async(req, res)=>{
    let scholar = await Scholar.findOne({_id: req.params.id})
    console.log(scholar)
    res.render('scholars/connect', {scholar})
});

router.post('/email', async(req, res)=>{
    try{
       let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass:process.env.GMAIL_PASS
           
        },
        tls:{
          rejectUnauthorized:false,
        }
    })
     var mailOptions={
               to: req.body.email,
               from: 'Eduline <noreply.'+process.env.GMAIL_EMAIL+'>',
               replyTo: process.env.GMAIL_EMAIL,
               subject: req.body.subject,
               text: req.body.mailBody,
     };
       
     transporter.sendMail(mailOptions, (err, info)=>{
        if(err){
            console.log(err.message)
            req.flash('error_msg', 'Scholarship message not sent')
            return res.redirect('/500');
        }else{
            console.log(info.message)
            req.flash('success_msg', 'Scholarship message delivered to' + " " + req.body.email +" " + 'successfully')
            return res.redirect('/scholarship/selected');
        }
     });
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500');
    }
 });

 router.get('/delete/:id', checkAdmin, async(req, res)=>{
     let scholar = await Scholar.findOne({_id: req.params.id})
     scholar.remove();
     req.flash('success', 'removed');
     res.redirect('back');
 });


 router.get('/selected', checkAdmin, async(req, res)=>{
      //pagination
   const page = parseInt(req.query.page)||1
   const limit = parseInt(req.query.limit)||1
   const count =await Scholar.countDocuments({isScholar: true})
   const pages = Math.ceil(count/limit)
   let nextIndex = (page+1)
   let startIndex = (page-1)
  
    if(nextIndex > pages){
       nextIndex=false;
   }
     let isScholars = await Scholar.find({isScholar: true}).sort({date:-1})
     .skip((limit*page)-limit).limit(limit)
       res.render('scholars/selected', {isScholars,page,count,limit,nextIndex,startIndex,pages});
 });

 router.get('/more', async(req, res)=>{
     let more = await Scholar.find({}).sort({date:-1})
      res.render('scholars/more', {more})
 });

module.exports = router;