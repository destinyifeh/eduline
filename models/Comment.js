const express = require('express');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const CommentSchema = new Schema({
        commentBody:{
            type: String,
            required: true,
        },

      username:{
          type: String
      },
      
      commentUser:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users'
      },
      commentDate:{
          type: Date,
          default: Date.now,
      },
      post:{
           type: mongoose.Schema.Types.ObjectId,
           ref: 'posts',
        
      },
      postId:{
          type: String,
      }
});



module.exports = Comment = mongoose.model('comments', CommentSchema);

