const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users', 
        },
        slug: {
            type: String,
            required: [true, 'Slug is mandatory field'],
            unique: true,
        },
        title: {
            type: String, 
            required: [true, 'Title is mandatory field'],
            max: 25,
        },
        description: {
            type: String, 
            required: [true, 'Description is mandatory field'],
        },
        blogContent: {
            type: String, 
            required: [true, 'Blog content is mandatory field'],
        },
        image: {
            type: String, 
            required: true,
        },
    }, 
    {
        timestamps: true,
    }, 
    {
        collection: 'blogPost'
    }
)

blogSchema.index({ slug: 1})

module.exports = mongoose.model.blogPost || mongoose.model('blogPost', blogSchema)
