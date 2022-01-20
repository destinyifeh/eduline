const mongoose = require('mongoose');
const slugify = require('slugify');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title:{
        type: String,
    },

    image:[{
        type:String,
    }],

    category:{
        type: String,
    },
      status:{
          type: String,
          default: 'published'
      },
    allowComment:{
        type: Boolean,
        default: true
    },
    detail:{
        type: String,
        
    },
    views:{
        type: Number,
        default:0
    },
    slug:{
        type: String,
        required: true,
        unique: true
    },
    cloudinary_id:[{
        type: String
    }],

    date:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now,
    },

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    commenting:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments',
    }],

});


PostSchema.pre('validate', function(){
    if(this.title){
        this.slug = slugify(this.title, {lower: true, strict: true})
    }
});


module.exports = Post = mongoose.model('posts', PostSchema);
