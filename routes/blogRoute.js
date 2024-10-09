const express = require('express')
const router = express.Router()

const { conditionalVerify, verifyUser } = require('../middleware/verify')
const { getRandomPosts, addBlogPost } = require('../controllers/blogController')
const upload = require('../middleware/upload')


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

module.exports = router