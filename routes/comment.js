const express = require('express');
const router = express.Router({mergeParams: true});

require('../models/Comment');
require('../models/Post');
require('../models/User');



router.get('/comment', async(req, res)=>{
    console.log(req.params);
    let post = await Post.findOne({slug: req.params.slug})
    res.render('comments/new', {title: 'New Comment - Eduline', post})
});


router.post('/comment', async(req, res)=>{
  try{
    const newComment={
          commentBody: req.body.commentBody,
          postId: req.params.slug,
          username: req.user.username,
          commentUser: req.user.id,
    }
   
     let comment = await Comment.create(newComment);
     let post = await Post.findOne({slug: req.params.slug});
     post.commenting.unshift(comment);
     post.save();
     console.log(comment);
     req.flash('success_msg', 'Comment added');
     res.redirect('/post/'+ post.slug); 
}
catch(err){
    console.log(err.message)
    res.redirect('/500')
}
});

router.get('/delete/comment/:id',async(req, res)=>{
     try{
          let comment = await Comment.findOne({_id: req.params.id})
          comment.remove();
          console.log(comment)
          req.flash('success_msg', 'Comment removed');
          res.redirect('back');
     }
     catch(err){
       console.log(err.message)
       res.redirect('/500');
     }
})



module.exports = router;
