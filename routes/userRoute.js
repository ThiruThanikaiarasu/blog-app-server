const express = require('express')
const router = express.Router()

const { check } = require('express-validator')
const { login, logout } = require('../controllers/authController')
const { verifyUser } = require('../middleware/verify')
const { signup } = require('../controllers/authController')
const upload = require('../middleware/upload')


router.post(
    '/signup',
    upload.single('image'),
    signup
)

router.post(
    '/login',
    check('email')
        .isEmail()
        .withMessage('Enter a valid email address')
        .normalizeEmail(),
    check('password')
        .not()
        .isEmpty(),
    login
)

router.get(
    '/logout',

    verifyUser,
    logout
)

module.exports = router 