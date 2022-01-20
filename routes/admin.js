const express = require('express');
const router = express.Router();

require('../models/User');
require('../models/Post');
require('../models/Comment');
require('../models/Scholar');
const {checkUser, checkAdmin, checkSuper} = require('../helpers/auth');

const layout = 'admin';


router.get('/dashboard', checkAdmin, async(req, res)=>{
    let users = await User.countDocuments({});
    let posts = await Post.countDocuments({});
    let scholars = await Scholar.countDocuments({});
    let selected = await Scholar.countDocuments({isScholar:true});
    let states = await Scholar.find({}).sort({date:-1}).limit(3);
    res.render('admins/index', {layout, states, users, selected, posts, scholars})
});
router.get('/users', checkAdmin, async(req, res)=>{
    //pagination
    const page = parseInt(req.query.page)||1
    const limit = parseInt(req.query.limit)||9
    const count =await User.countDocuments({})
    const pages = Math.ceil(count/limit)
    let nextIndex = (page+1)
    let startIndex = (page-1)
   
     if(nextIndex > pages){
        nextIndex=false;
    }
    const users =  await User.find({}).skip((limit*page)-limit).limit(limit).sort({date:-1}).populate('user')
    .populate('user')
    res.render('admins/users', {layout, users, page, pages, nextIndex, startIndex});

});
router.get('/posts', checkAdmin, async(req, res)=>{
   //pagination
   const page = parseInt(req.query.page)||1
   const limit = parseInt(req.query.limit)||9
   const count =await Post.countDocuments({status:'published'})
   const pages = Math.ceil(count/limit)
   let nextIndex = (page+1)
   let startIndex = (page-1)
  
    if(nextIndex > pages){
       nextIndex=false;
   }
   const posts =  await Post.find({status:'published'}).skip((limit*page)-limit).limit(limit).sort({updatedAt:-1, date:-1})
   .populate('commenting')
   res.render('admins/posts', {layout, posts, page, pages, nextIndex, startIndex});

});
router.get('/comments', checkAdmin, async(req, res)=>{
      //pagination
      const page = parseInt(req.query.page)||1
      const limit = parseInt(req.query.limit)||9
      const count =await Comment.countDocuments({})
      const pages = Math.ceil(count/limit)
      let nextIndex = (page+1)
      let startIndex = (page-1)
     
       if(nextIndex > pages){
          nextIndex=false;
      }
      const comments =  await Comment.find({}).skip((limit*page)-limit).limit(limit).sort({commentDate:-1}).populate('commentUser').populate('post');
      res.render('admins/comments', {layout, comments, page, pages, nextIndex, startIndex});
  
});


      
//admin user confirmation before delete
  router.get('/userDelete/:id', checkSuper, async(req, res)=>{
      let del = await User.findOne({_id: req.params.id})
    res.render('admins/userDelete', {del})
});

//post search route//


router.get('/search_post', async(req, res)=>{
    try{
     
      let {query} = req.query;
      let q = new RegExp(query, 'i');
          //pagination
    const page = parseInt(req.query.page)||1
    const limit = parseInt(req.query.limit)||9
    const count =await Post.countDocuments({title: q, detail:q})
    const pages = Math.ceil(count/limit)
    let nextIndex = (page+1)
    let startIndex = (page-1)
   
     if(nextIndex > pages){
        nextIndex=false;
    }
     
     let posts = await Post.find({$or:[{title: q}, {detail: q}]})
      .skip((limit*page)-limit).limit(limit).sort({date:-1});
      res.render('admins/search_results', {posts, query,page, limit, nextIndex, startIndex })
    }
    catch(err){
        console.log(err.message)
        res.status(500).redirect('/500');
    }
});

router.get('/search_user', async(req, res)=>{
    try{
     
      let {query} = req.query;
      let q = new RegExp(query, 'i');
          //pagination
    const page = parseInt(req.query.page)||1
    const limit = parseInt(req.query.limit)||9
    const count =await User.countDocuments({username: q, email:q})
    const pages = Math.ceil(count/limit)
    let nextIndex = (page+1)
    let startIndex = (page-1)
   
     if(nextIndex > pages){
        nextIndex=false;
    }
     
     let users = await User.find({$or:[{username: q}, {email: q}]})
      .skip((limit*page)-limit).limit(limit).sort({date:-1});
      res.render('admins/search_results', {users, query,page, limit, nextIndex, startIndex })
    }
    catch(err){
        console.log(err.message)
        res.status(500).redirect('/500');
    }
});

router.get('/search_comment', async(req, res)=>{
    try{
     
      let {query} = req.query;
      let q = new RegExp(query, 'i');
          //pagination
    const page = parseInt(req.query.page)||1
    const limit = parseInt(req.query.limit)||9
    const count =await Comment.countDocuments({commentBody: q, username:q})
    const pages = Math.ceil(count/limit)
    let nextIndex = (page+1)
    let startIndex = (page-1)
   
     if(nextIndex > pages){
        nextIndex=false;
    }
     
     let comments = await Comment.find({$or:[{commentBody: q}, {username: q}]})
      .skip((limit*page)-limit).limit(limit).sort({date:-1});
      res.render('admins/search_results', {comments, query,page, limit, nextIndex, startIndex })
    }
    catch(err){
        console.log(err.message)
        res.status(500).redirect('/500');
    }
});

module.exports = router;