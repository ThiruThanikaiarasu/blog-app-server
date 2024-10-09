const express = require('express')
const router = express.Router()

const { conditionalVerify } = require('../middleware/verify')
const { getRandomPosts } = require('../controllers/blogController')


router.get(
    '/getPosts',
    conditionalVerify,
    getRandomPosts
)

module.exports = router