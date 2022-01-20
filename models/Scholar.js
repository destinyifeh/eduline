const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ScholarSchema = new Schema({
       firstName:{
           type: String,
           required: true,
       },
      
     
      lastName:{
           type: String,
           required: true
       },
       email:{
           type: String,
           required: true
       },

       regNumber:{
           type: String,
           required: true,
       },
       choice:{
           type: String,
           required: true,
       },
       score:{
           type: Number,
           required: true,
       },
       state:{
           type: String,
           required: true
       },
       account:{
           type: Number,
           required: true
       },
       actName:{
           type: String,
           required: true
       },
       bank:{
           type: String,
           required: true
       },
       gender:{
           type: String,
           required: true
       },
       date:{
           type: Date,
           default: Date.now,
       },
       user:{
           type: String
       },
       isScholar:{
        type: Boolean,
        default: false
    },
      
      
});




module.exports = Scholar = mongoose.model('scholars', ScholarSchema);