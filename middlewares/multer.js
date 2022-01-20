const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const env = require('dotenv');

env.config({path: '../.env'});


cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.apiKey,
    api_secret: process.env.apiSecret
});


var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb (null, 'public/uploads')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + "_" + file.originalname);
    }
});

function fileFilter(req, file, cb){
     if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' 
     || file.mimetype === 'image/png'){
         cb(null, true)
     }else{
         cb(new Error ('Unsupported file type'), false);
     }
}




module.exports = upload = multer({storage: storage, fileFilter:fileFilter, limit:{filesize:1000000}});