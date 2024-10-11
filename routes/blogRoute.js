const express = require('express')
const router = express.Router()

const { conditionalVerify, verifyUser } = require('../middleware/verify')
const { getRandomPosts, addBlogPost, getUserActionOfABlog, toggleLike, toggleBookmark, addRootComment, addReplyComment, getNestedCommentsOfParentComment } = require('../controllers/blogController')
const upload = require('../middleware/upload')
const { verify } = require('jsonwebtoken')


router.get(
    '/getPosts',
    conditionalVerify,
    getRandomPosts
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
    getUserActionOfABlog
)

router.post(
    '/:slug/like',
    verifyUser,
    toggleLike
)


router.post(
    '/addBlog',
    upload.single('image'),
    verifyUser,
    addBlogPost
)

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

router.post(
    '/:slug/bookmark',
    verifyUser,
    toggleBookmark
)

module.exports = router