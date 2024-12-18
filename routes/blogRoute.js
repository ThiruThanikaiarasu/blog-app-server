const express = require('express')
const router = express.Router()

const { conditionalVerify, verifyUser } = require('../middleware/verify')
const { getRandomPosts, addBlogPost, getUserActionOfABlog, toggleLike, toggleBookmark, addRootComment, addReplyComment, getNestedCommentsOfParentComment, editComment, getAPostDetails, getHomeFeed } = require('../controllers/blogController')
const upload = require('../middleware/upload')


router.get(
    '/getPosts',
    conditionalVerify,
    getRandomPosts
)

router.get(
    '/feed',
    conditionalVerify,
    getHomeFeed
)

router.post(
    '/addBlog',
    upload.single('image'),
    verifyUser,
    addBlogPost
)

router.get(
    '/:slug',
    conditionalVerify,
    getAPostDetails
)

router.get(
    '/:slug/details',
    conditionalVerify,
    getUserActionOfABlog
)

router.post(
    '/:slug/like',
    verifyUser,
    toggleLike
)


// router.post(
//     '/addBlog',
//     upload.single('image'),
//     verifyUser,
//     addBlogPost
// )

router.post(
    '/:slug/addComment',
    verifyUser,
    addRootComment
)

router.post(
    '/:slug/addReplyComment',
    verifyUser,
    addReplyComment
)

router.post(
    '/:slug/getReplyComments',
    conditionalVerify,
    getNestedCommentsOfParentComment
)

router.patch(
    '/:slug/editComment',
    verifyUser,
    editComment
)

router.post(
    '/:slug/bookmark',
    verifyUser,
    toggleBookmark
)

module.exports = router