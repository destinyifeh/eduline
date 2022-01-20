const mongoose = require('mongoose');
const slugify = require('slugify');
const comment = require('./Comment');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

         username:{
             type: String,
              required: true,
              unique: true,
         },
         email:{
             type: String,
             required: true,
             unique: true
         },

         gender:{
             type: String
         },
         password:{
             type: String,
             required: true
         },
       
         superAdmin:{
             type: Boolean
         },
         isAdmin:{
             type: Boolean
         },
         isMale:{
            type: Boolean
        },
        adminCode:{
            type: String,
        },
         slug:{
             type: String,
             required: true,
             unique: true
         },
         date:{
             type: Date,
             default: Date.now,
         },

         post:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'posts',
         },
         resetPasswordToken:String,
         resetPasswordExpires: Date,
        


});


UserSchema.pre('validate', function(){
    if(this.username){
        this.slug = slugify(this.username, {lower: true, strict: true})
    }
});


UserSchema.pre('remove', function(next){
    let id = this._id
  
    comment.deleteMany({user: id}, function(err, result){
        if(err){
            next(err)
        }
        else{
            next();
        }
    })
     
}); 


module.exports = User = mongoose.model('users', UserSchema);