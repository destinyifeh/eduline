const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const env = require('dotenv');
const async = require('async');
const router = express.Router();
const {checkUser, checkAdmin, checkSuper} = require('../helpers/auth');

env.config({path: '../.env'});

require('../models/User');
require('../models/Notification');

/*
router.get('/user/registration', (req, res)=>{
    res.render('users/registration', {title: 'Sign Up - Eduline'})
});*/

router.get('/login', (req, res)=>{
    res.render('users/login', {title: 'Login - Eduline'});
});



router.get('/user/registration', async(req, res)=>{ 
   try{
 
    res.render('users/register', {title: 'Membership Registration - Eduline'});
}
catch(err){
  console.log(err.message)
}
 });




router.get('/profile', (req, res)=>{
    res.render('users/profile', {title: 'Profile - Eduline'});
});

router.get('/edit', (req, res)=>{
    res.render('users/edit');
});



router.post('/register', async(req, res, next)=>{
     try{
       
        let errors = [];
         
        let userEmail = await User.findOne({email: req.body.email})
        if(userEmail){
            errors.push({text: 'This email already exist'});
        }
        if(!req.body.username || !req.body.email || !req.body.password || !req.body.password2){
            errors.push({text: 'Empty input fill it up'});
        }
        if(req.body.password != req.body.password2){
            errors.push({text: 'Password do not match'});
        }
        if(req.body.gender == 'select'){
            errors.push({text: 'Select gender'});
        }
        if(req.body.password.length < 4){
            errors.push({text: 'Your password must be atleast 4 characters'});
        }
        if(errors.length >0){
            res.render('users/register', {
                errors: errors,
                username: req.body.username,
                email: req.body.email,
                gender: req.body.gender,
                password: req.body.password,
                password2: req.body.password2,
                adminCode: req.body.adminCode
            })
        }else{
           let user = await User.findOne({username: req.body.username})
           if(user){
               req.flash('error_msg', 'This username already exist')
               return res.redirect('back');
           }else{
               const newUser = {
                username: req.body.username,
                email: req.body.email,
                gender: req.body.gender,
                password: req.body.password,
                adminCode: req.body.adminCode
               }
               if(req.body.username == process.env.superAdmin){
                   newUser.superAdmin =true;
               }else{
                     newUser.superAdmin =false;
               }
               if(req.body.adminCode == process.env.isAdmin){
                   newUser.isAdmin = true;
               }else{
                    newUser.isAdmin = false;
               }
             
               if(req.body.gender == 'm'){
                   newUser.isMale=true;
               }else{
                   newUser.isMale=false;
               }
               //for notification signup
               
                   bcrypt.genSalt(10, (err, salt)=>{
                   bcrypt.hash(newUser.password, salt, (err, hash)=>{
                       if(err) throw err;
                       newUser.password = hash;
                       User.create(newUser, async(err, user)=>{
                          if(err) throw err;
                          const newNotification={
                            username: req.body.username,
                            gender: req.body.gender,
                            userId: user.id, 
                     };
                     let notification = await Notification.create(newNotification);
                        console.log(notification);
                        //notification end
                        console.log(newUser);
                         //let rgistered user logged in automatically or being authenticated after registering//
                        passport.authenticate('local', (err, user, info)=>{
                          if(err) throw next(err);
                          if(!user){
                              req.flash('error_msg', 'Incorrect credentials')
                              return res.redirect('back')
                          }
                          req.login(user, (err)=>{
                              if(err) throw next(err);
                              if(req.user.superAdmin || req.user.isAdmin){
                                  req.flash('success_msg', 'Hi' + ' ' + req.user.username + ' ' + 'your admin account created successfully')
                                  return res.redirect('/admin/dashboard');
                              }else{
                           req.flash('success_msg', 'Account created successfully');
                          res.redirect('/posts');
                              }
                          })
                      })(req, res, next);   
                      //logged in automatically end//       
                     
                       });
                      
                   })
               })
           }
        }
     }
     catch(err){
         console.log(err.message)
         res.redirect('/500');
     }
});


router.post('/login', async(req, res, next)=>{
    try{
    passport.authenticate('local', (err, user, info)=>{
        if(err) throw next(err);
        if(!user){
            req.flash('error_msg', 'Incorrect credentials')
            return res.redirect('back')
        }
        req.login(user, (err)=>{
            if(err) throw next(err);
            if(req.user.superAdmin || req.user.isAdmin){
                req.flash('success_msg', 'Welcome' + ' ' + req.user.username)
                return res.redirect('/admin/dashboard');
            }else{
                req.flash('success_msg', 'You logged in sucessfully')
                res.redirect('/posts');
            }
        })
    })(req, res, next);
}
 catch(err){
    console.log(err.message)
    res.redirect('/500');
}
});


router.get('/logout', (req, res)=>{
    try{
    req.logout();
    req.flash('success_msg', 'You logged out')
    res.redirect('/')
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500');
    }
});


router.get('/profile', async(req, res)=>{
    let user = await User.findOne({slug: req.user.slug});
    res.render('users/profile', {user});
});

//user notification route//
router.get('/user/notification/:slug', async(req, res)=>{
    try{
      let notification = await Notification.findOne({slug: req.params.slug});
      notification.isRead=true;
      notification.save();
      res.redirect('/profile/'+notification.slug)
    }
    catch(err){
      console.log(err.message)
      res.redirect('/500')
    }
});

//delete notification
router.get('/delete/note/:slug', async(req, res)=>{
  try{
  let note = await Notification.findOne({slug: req.params.slug});
     note.remove();
     req.flash('success_msg', 'User notification removed')
     res.redirect('/admin/dashboard');
  }
  catch(err){
    console.log(err.message)
    res.redirect('/500');
  }
  
});

router.get('/profile/:slug', checkUser, async(req, res)=>{
    let user = await User.findOne({slug: req.params.slug});
    //let the user viewing another user profile show on the header
    let viewer = await User.findOne({slug: req.user.slug});
   
    res.render('users/public', {user, viewer, title: `${user.username} Profile - Eduline`});
});


router.get('/edit/:slug', checkSuper, async(req, res)=>{
    try{
    let user = await User.findOne({slug: req.params.slug})
      //let the user viewing another user profile show on the header
      let viewer = await User.findOne({slug: req.user.slug});
    res.render('users/edit', {user, viewer});
    }
    catch(err){
        console.log(err)
        res.redirect('/500');
    }
});

router.put('/user/:slug',async (req, res)=>{
     
    try{
   let user = await User.findOne({slug: req.params.slug})
     if(!user){
         res.flash('error_msg', 'User does not exist')
         res.redirect('back')
     }else{
         user.username = req.body.username,
         user.gender = req.body.gender,
         user.email = req.body.email,
         user.adminCode = req.body.adminCode
     }
       if(req.body.adminCode == process.env.isAdmin){
           user.isAdmin=true;
       }else{
        if(req.body.adminCode != process.env.isAdmin ){
            user.isAdmin=false;
            }
       }
       if(req.body.username == process.env.superAdmin){
           user.superAdmin = true;
       }else{
        if(req.body.username != process.env.superAdmin){
            user.superAdmin=false;
        }
       }
      
       console.log(user)
       user.save();
        req.flash('success_msg', 'User' + ' '+ user.username + ' ' + 'updated successfully!')
        res.redirect('/admin/users');
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500')
    }
});




router.get('/email/:slug', async(req, res)=>{
    try{
        let user = await User.findOne({slug: req.params.slug});
        let sender = await User.findOne({slug: req.user.slug});

        res.render('users/email', {user, sender});
    }
    catch(err){
        console.log(err.message)
        res.status(500).redirect('/500');
    }
});


//delete user route

router.get('/delete/user/:id', checkSuper, async(req, res)=>{
   
        try{
          let user = await User.findOne({_id: req.params.id})
          user.remove((commentData)=>{
            console.log(commentData)
            req.flash('success_msg', 'User' + ' '+ user.username + ' ' + 'delated successfully!')
            res.redirect('/admin/users');
          
          })
        }
        catch(err){
            console.log(err.message)
            res.redirect('/500');
        }
       }); 
  

      

//Confirm delete by user before deactivating
  router.get('/delete', (req, res)=>{
      res.render('users/delete')
  });



  //forgot password page

  router.get('/forgot', (req, res)=>{
      res.render('users/forgot', {title: 'Forgot Password - Eduline'})
  });

  router.get('/reset', (req, res)=>{
      res.render('users/reset', {title: 'Reset Password - Eduline'})
  });

  

router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error_msg', 'No account with that email address exists.');
            return res.redirect('back');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
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
      });
        var mailOptions = {
          to: user.email,
          from: 'Eduline <noreply.'+process.env.GMAIL_EMAIL+'>',
          subject: 'Eduline Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.hostname + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        transporter.sendMail(mailOptions, function(err) {
          req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  //end of forget post

//Gettin the reset token


router.get('/reset/:token', function(req, res) {
User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
  if (!user) {
    req.flash('error_msg', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgot');
  }
  res.render('users/reset',{token: req.params.token});
});
});









router.post('/reset/:token', function(req, res) {
async.waterfall([
  function(done) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired.');
        return res.redirect('back');
      }
        if(req.body.password.length < 4){
           req.flash('error_msg', 'Password must be atleast 4 character.')
           return res.redirect('back')
        }
       if(req.body.password === req.body.password2){

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
            
       bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(user.password, salt, (err,hash)=>{
         if(err) throw err;
        user.password = hash;
        console.log(user.password)
      user.save(function(err) {
        req.logIn(user, function(err) {
          done(err, user);
        });
      });
    });
    });
  } else{
    req.flash('error_msg', 'Passwords do not match.');
     return res.redirect('back');
  }
  })
  },
  function(user, done) {
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
  });
    var mailOptions = {
      to: user.email,
      from: 'Eduline <noreply.'+process.env.GMAIL_EMAIL+'>',
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    };
    transporter.sendMail(mailOptions, function(err) {
     
      req.flash('success_msg', 'Success! Your password has been changed.');
      done(err);
    });
  }
], function(err) {
    if(err){
    console.log(err.message)
   res.redirect('/500');
    }
  res.redirect('/');
});
});




module.exports = router;