const express = require('express')
const router = express.Router()

const { getGoogleAuthPageUrl, handleGoogleAuthCallback, verifyToken } = require('../controllers/googleAuthController')


router.get(
    '/page-request', 

    getGoogleAuthPageUrl
)

router.get('/verify-user', 

    handleGoogleAuthCallback
)

router.get(
    '/verify', 

    verifyToken
)

module.exports = router