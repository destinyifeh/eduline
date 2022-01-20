const express = require('express');
const mongoose = require('mongoose')
const slugify = require('slugify');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
       username:{
           type: String,
       },
       gender:{
        type: String,
    },
       userId:{
           type: String,
       },
      
        date:{
           type: Date,
           default: Date.now
       },
       isRead:{
           type: Boolean,
           default: false
       },

       slug:{
           type: String,
           unique: true,
           required: true,
       }
});



NotificationSchema.pre('validate', function(){
    if(this.username){
        this.slug = slugify(this.username, {lower: true, strict:true});
    }
});



module.exports = Notification = mongoose.model('notifications', NotificationSchema);