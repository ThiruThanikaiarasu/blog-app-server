const express = require('express')
const router = express.Router()

const { check } = require('express-validator')
const { login, logout } = require('../controllers/authController')
const { verifyUser } = require('../middleware/verify')
const { signup } = require('../controllers/authController')
const upload = require('../middleware/upload')
const { getUsersPostsAndBookmarks } = require('../controllers/userController')


router.post(
    '/signup',
    upload.single('image'),
    signup
)

router.post(
    '/login',
    login
)

router.post(
    '/logout',

    verifyUser,
    logout
)

router.get(
    '/posts',

    verifyUser,
    getUsersPostsAndBookmarks
)

module.exports = router 