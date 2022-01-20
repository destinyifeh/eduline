const https = require('https');
module.exports={
    checkUser: function(req, res, next){
         
        if(req.isAuthenticated()){
            return next();
        }else{
        
            req.flash('error_msg', 'Unauthorized! Login or register to access this page')
            res.redirect('back')
        
        }
            
 },

 checkAdmin: async function (req, res, next){
     try{
     if(req.user.isAdmin || req.user.superAdmin){
        return next();

     }else{
           req.flash('error_msg', 'Unauthorized access!');
            res.redirect('back');
     }
    }
    catch(err){
        console.log(err.message)
        res.redirect('/500');
    }
 },
 checkSuper: async function (req, res, next){
    try{
    if(req.user.superAdmin){
       return next();

    }else{
          req.flash('error_msg', 'Unauthorized access!');
           res.redirect('back');
    }
   }
   catch(err){
       console.log(err.message)
       res.redirect('/500');
   }
},
 
};