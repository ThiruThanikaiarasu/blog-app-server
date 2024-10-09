const mongoose = require('mongoose')

const blogBookmarkSchema = new mongoose.Schema(
    {
        bookmarkedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        bookmarkedPost: {
            type: String,
            required: [true, 'Bookmarked Post is a mandatory field']
        },
    },
    {
        timestamps: true, 
    },
    {
        collection: 'blogBookmarks' 
    }
)

module.exports = mongoose.model.blogBookmark || mongoose.model('blogBookmark', blogBookmarkSchema)
