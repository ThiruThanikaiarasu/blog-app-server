const mongoose = require('mongoose')

const blogLikesSchema = new mongoose.Schema(
    {
        likedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        likedPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blogPost'
        },
    },
    {
        timestamps: true,
    },
    {
        collection: 'blogLikes'
    }
)

module.exports = mongoose.model.blogLikes || mongoose.model('blogLikes', blogLikesSchema)