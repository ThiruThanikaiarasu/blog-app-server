const mongoose = require('mongoose')

const blogLikesSchema = new mongoose.Schema(
    {
        likedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        likedPost: {
            type: String,
            required: [true, 'Reference to Liked post Slug field is mandatory'],
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