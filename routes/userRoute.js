const express = require('express')
const router = express.Router()

const { check } = require('express-validator')
const { login, logout } = require('../controllers/authController')
const { verifyUser } = require('../middleware/verify')
const { signup } = require('../controllers/authController')


router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Enter a valid Email address')
        .normalizeEmail(),
    check('firstName')
        .not()
        .isEmpty()
        .withMessage('First name is a mandatory field')
        .trim()
        .escape(),
    check('lastName')
        .not()
        .isEmpty()
        .withMessage('First name is a mandatory field')
        .trim()
        .escape(),
    check('password')
        .notEmpty()
        .isLength({min: 8})
        .withMessage('Password length is at least 8 character'),
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