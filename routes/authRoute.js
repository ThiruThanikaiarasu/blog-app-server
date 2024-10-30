const express = require('express')
const router = express.Router()

const { signup, login, sendSignupVerificationCode, verifyOtp } = require('../controllers/authController')


router.post(
    '/signup', 
    
    signup
)

router.post(
    '/signup/request-verification',

    sendSignupVerificationCode
)

router.post(
    '/signup/otp-verify',

    verifyOtp
)

router.post(
    '/login', 
    
    login
)

module.exports = router