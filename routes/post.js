const express = require('express');
const router = express.Router();
const fs = require('fs');
const moment = require('moment');
const cloudinary = require('cloudinary');

const upload = require('../middlewares/multer');
const uploadMethod = require('../middlewares/multipleUpload');
const {checkUser, checkAdmin} = require('../helpers/auth');
require('../models/User');
require('../models/Comment');
require('../models/Post');

//Main page
router.get('/',  async(req, res)=>{
    let post1 = await Post.find({status: 'published'}).sort({updatedAt:-1, date:-1}).limit(1);
    let post2 = await Post.find({status: 'published'}).sort({updatedAt:-1, date:-1}).skip(1).limit(1);
    let post3 = await Post.find({status: 'published'}).sort({updatedAt:-1, date:-1}).skip(2).limit(1);
   
    res.render('index', { title: 'Education And Scholarship Portal - Eduline', post1, post2, post3});
});

//Saved posts
router.get('/saved/posts', checkAdmin, async(req, res)=>{
 
    //pagination
    const page = parseInt(req.query.page)||1
    const limit = parseInt(req.query.limit)||9
    const count =await Post.countDocuments({status:'saved'})
    const pages = Math.ceil(count/limit)
    let nextIndex = (page+1)
    let startIndex = (page-1)
   
     if(nextIndex > pages){
        nextIndex=false;
    }
    const posts =  await Post.find({status:'saved'}).skip((limit*page)-limit).limit(limit).sort({updatedAt:-1 , date:-1}).populate('user')
      res.render('posts/saved', {title: 'Saved Posts - Eduline', page, limit, nextIndex, startIndex, posts})
});

router.get('/about', (req, res)=>{
    res.render('about', {title: 'About Us - Eduline'});
});

router.get('/privacy', (req, res)=>{
    res.render('privacy', {title: 'Privacy Policy - Eduline'});
});


router.get('/disclaimer', (req, res)=>{
    res.render('disclaimer', {title: 'Disclaimer - Eduline'});
});

router.get('/contact', (req, res)=>{
    res.render('contact', {title: 'Contact Us - Eduline'});
});

//All posts

router.get('/posts', checkUser, async(req, res)=>{
    
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
    const posts =  await Post.find({status:'published'}).skip((limit*page)-limit).limit(limit).sort({updatedAt:-1 , date:-1}).populate('user')
    .populate('commenting')
    res.render('home', { posts, page, pages, nextIndex, startIndex});


});

//category posts or pages

router.get('/scholarship', checkUser, async(req, res)=>{
      //pagination
      const page = parseInt(req.query.page)||1
      const limit = parseInt(req.query.limit)||9
      const count =await Post.countDocuments({status: 'published', category: 'scholarship'});
      const pages = Math.ceil(count/limit)
      let nextIndex = (page+1)
      let startIndex = (page-1)
     
       if(nextIndex > pages){
          nextIndex=false;
      }
   let posts = await Post.find({status:'published', category: 'scholarship'}).skip((limit*page)-limit).sort({date:-1}).limit(limit)
    res.render('posts/scholarship', {title: 'Scholarship - Eduline', posts, page, limit, nextIndex, startIndex});
});

router.get('/news', checkUser, async(req, res)=>{
       //pagination
       const page = parseInt(req.query.page)||1
       const limit = parseInt(req.query.limit)||9
       const count =await Post.countDocuments({status: 'published', category: 'news'});
       const pages = Math.ceil(count/limit)
       let nextIndex = (page+1)
       let startIndex = (page-1)
      
        if(nextIndex > pages){
           nextIndex=false;
       }
    let posts = await Post.find({status:'published', category: 'news'}).skip((limit*page)-limit).sort({date:-1}).limit(limit)
    res.render('posts/news', {title: 'News - Eduline', posts, page, limit, nextIndex, startIndex});
});


router.get('/admission', checkUser, async(req, res)=>{
      //pagination
      const page = parseInt(req.query.page)||1
      const limit = parseInt(req.query.limit)||9
      const count =await Post.countDocuments({status: 'published', category: 'admission'});
      const pages = Math.ceil(count/limit)
      let nextIndex = (page+1)
      let startIndex = (page-1)
     
       if(nextIndex > pages){
          nextIndex=false;
      }
   let posts = await Post.find({status:'published', category: 'admission'}).skip((limit*page)-limit).sort({date:-1}).limit(limit)
    res.render('posts/admission', {title: 'Admission - Eduline', posts, page, limit, nextIndex, startIndex});
});

router.get('/event', checkUser, async(req, res)=>{
      //pagination
      const page = parseInt(req.query.page)||1
      const limit = parseInt(req.query.limit)||9
      const count =await Post.countDocuments({status: 'published', category: 'event'});
      const pages = Math.ceil(count/limit)
      let nextIndex = (page+1)
      let startIndex = (page-1)
     
       if(nextIndex > pages){
          nextIndex=false;
      }
   let posts = await Post.find({status:'published', category: 'event'}).skip((limit*page)-limit).sort({date:-1}).limit(limit)
    res.render('posts/event', {title: 'Event - Eduline', posts, page, limit, nextIndex, startIndex});
});

router.get('/jamb', checkUser, async(req, res)=>{
      //pagination
      const page = parseInt(req.query.page)||1
      const limit = parseInt(req.query.limit)||9
      const count =await Post.countDocuments({status: 'published', category: 'jamb'});
      const pages = Math.ceil(count/limit)
      let nextIndex = (page+1)
      let startIndex = (page-1)
     
       if(nextIndex > pages){
          nextIndex=false;
      }
   let posts = await Post.find({status:'published', category: 'jamb'}).skip((limit*page)-limit).sort({date:-1}).limit(limit)
    res.render('posts/jamb', {title: 'Jamb - Eduline', posts, page, limit, nextIndex, startIndex});
});

//new / add post page
router.get('/post/new', checkAdmin, (req, res)=>{
       
      res.render('posts/new');
 
});




router.post('/post', upload.array('image'), async(req, res)=>{
    
    
       let errors = [];
       
       let postTitle = await Post.findOne({title: req.body.title});
       if(postTitle){
           errors.push({text: 'This post title already exist'});
       }
     if(!req.body.title || !req.body.detail){
     errors.push({text: 'Post title or detail must not be empty'})
     }
      if(req.body.category=='select'){
          errors.push({text: 'Select post category'})
      }
      if(errors.length > 0){
        res.render('posts/new', {
            errors: errors,
            title: req.body.title,
            detail: req.body.detail,
            category: req.body.category,
            status: req.body.status,
           
        });
        
      }else{
          try{
            if(req.method === 'POST'){
                const urls = [];
                const files = req.files;
                for(const file of files){
                    const {path} = file;
                    const newPath = await uploadMethod(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                }        
                  const newPost={
                title: req.body.title,
                detail: req.body.detail,
                category: req.body.category,
                status: req.body.status,
                image:urls.map(url=>url.result),
                cloudinary_id: urls.map(url=>url.id),
            }
               
            if(req.body.allowComment){
               newPost.allowComment=true;
           }else{
               newPost.allowComment=false;
            };
             let post = await Post.create(newPost)
            console.log(newPost)
            req.flash('success_msg', 'Post successfully added')
             res.redirect('/admin/posts');
     }
    }
     catch(err){
        console.log(err.message);
        res.status(500).redirect('/500');
        
    }
}


}); 



    



    router.get('/post/:slug', checkUser, async(req, res)=>{
        try{
        let post = await Post.findOne({slug: req.params.slug}).populate('commenting').populate('user');
        let recents = await Post.find({status: 'published', slug:{$nin:post.slug}}).sort({updatedAt:-1, date:-1}).limit(4)
        let latest = await Post.find({status: 'published'}).sort({updatedAt:-1, date:-1}).limit(3)
        let top = await Post.find({status: 'published'}).sort({views:-1}).limit(4)
        let q = new RegExp(post.category, 'i');
        let featured = await Post.find({ slug:{$nin:post.slug}, status: 'published', $or:[{category:q}]}).sort({updatedAt:-1, date:-1}).limit(4)
       
        post.views++;
        post.save();
       
        //pagination
      const page = parseInt(req.query.page)||1
      const limit = parseInt(req.query.limit)||10
      const count =await Comment.countDocuments({postId:req.params.slug})
      const pages = Math.ceil(count/limit)
      let nextIndex = (page+1)
      let startIndex = (page-1)
     
       if(nextIndex > pages){
          nextIndex=false;
      }
      let comments = await Comment.find({postId:req.params.slug}).sort({commentDate:-1}).populate('commentUser').populate('post')
      .skip((limit*page)-limit).limit(limit);
       // console.log(post)
        res.render('posts/show', {title: `${post.title} | Eduline`, post, page, limit, nextIndex, startIndex, recents, latest, top, featured, comments});
      
        }
        catch(err){
            console.log(err.message)
            res.status(500).redirect('/500');
        }
    });


//getting page without image update

router.get('/edit/post/:slug', checkAdmin, async(req, res)=>{
    try{
    const post = await Post.findOne({slug: req.params.slug});
     res.render('posts/edit', {post});
  
    }
    catch(err){
        console.log(err.message)
        res.status(500).redirect('/500');
    }
});

//getting update post with image page
router.get('/edit_image/post/:slug', checkAdmin, async(req, res)=>{
    try{
    const post = await Post.findOne({slug: req.params.slug});
     res.render('posts/edit2', {post});
  
    }
    catch(err){
        console.log(err.message)
        res.status(500).redirect('/500');
    }
}); 

//Update post with image route

router.put('/update_post/post/:slug', upload.array('image'), async(req, res)=>{
       try{
             let allowComment;
           if(req.body.allowComment){
               allowComment = true;
           }else{
               allowComment = false;
           };
           let errors = [];
       
           if(!req.body.title || !req.body.detail){
           errors.push({text: 'Post title or detail must not be empty'})
           }
            if(req.body.category=='select'){
                errors.push({text: 'Select post category'})
            }
            if(errors.length > 0){
              res.render('posts/edit2', {
                  errors: errors,
                  title: req.body.title,
                  detail: req.body.detail,
                  category: req.body.category,
                  status: req.body.status,
                  allowComment: allowComment
             });
              
         }else{
         let post = await Post.findOne({slug: req.params.slug})
          cloudinary.api.delete_resources(post.cloudinary_id);
         if(req.method === 'PUT'){
            const urls = [];
            const files = req.files;
            for(const file of files){
                const {path} = file;
                const newPath = await uploadMethod(path)
                urls.push(newPath)
                fs.unlinkSync(path)
            } 
            post.detail = req.body.detail,
            post.title = req.body.title,
           post.allowComment = allowComment,
           post.category =  req.body.category,
           post.status =  req.body.status,
           post.cloudinary_id = urls.map(url=>url.id),
           post.image = urls.map(url=>url.result),
           updatedAt = moment().date('fromNow'),
           post.save();
      
          console.log(post)
         req.flash('success_msg', 'Post successfully updated')
          res.redirect('/admin/posts');
       }
  
    }
   }
   
     catch(err){
   console.log(err)
  res.status(500).redirect('/500');
 }
});

//updating post without image
router.put('/update/post/:slug', upload.array('image'), async(req, res)=>{
       try{
             let allowComment;
           if(req.body.allowComment){
               allowComment = true;
           }else{
               allowComment = false;
           };
           let errors = [];
       
           if(!req.body.title || !req.body.detail){
           errors.push({text: 'Post title or detail must not be empty'})
           }
            if(req.body.category=='select'){
                errors.push({text: 'Select post category'})
            }
            if(errors.length > 0){
              res.render('posts/edit', {
                  errors: errors,
                  title: req.body.title,
                  detail: req.body.detail,
                  category: req.body.category,
                  status: req.body.status,
                  allowComment: allowComment
             });
              
         }else{
         let post = await Post.findOne({slug: req.params.slug})
           if(!post){
               res.redirect('/admin/posts')
           }
       
    
        post.detail = req.body.detail,
        post.title = req.body.title,
       post.allowComment = allowComment,
       post.category =  req.body.category,
       post.status =  req.body.status,

       post.updatedAt = moment().date('fromNow'),
       post.save();
       console.log(post)
       req.flash('success_msg', 'Post successfully updated')
        res.redirect('/posts');
    }
    }
   
   
     catch(err){
   console.log(err)
  res.status(500).redirect('/500');
 }
});




router.get('/search', async(req, res)=>{
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
      res.render('posts/search_result', {title: `Search Results For ${query} - Eduline`, posts, query,page, limit, nextIndex, startIndex })
    }
    catch(err){
        console.log(err.message)
        res.status(500).redirect('/500');
    }
});


//Delete post

router.get('/delete/post/:slug', checkAdmin, async(req, res)=>{
    try{
        let post = await Post.findOne({slug: req.params.slug});
        cloudinary.api.delete_resources(post.cloudinary_id);
       Post.deleteOne({slug: req.params.slug})
       .then(()=>{
           req.flash('success_msg', 'Post deleted')
           res.redirect('back');
       })
    }
    catch(err){
        console.log(err.message)
        res.status(500).redirect('/500');
    }
});




module.exports = router;