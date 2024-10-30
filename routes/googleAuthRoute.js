const express = require('express')
const router = express.Router()

const { getGoogleAuthPageUrl, handleGoogleAuthCallback } = require('../controllers/googleAuthController')


router.get(
    '/page-request', 

    getGoogleAuthPageUrl
)

router.get('/verify-user', 

    handleGoogleAuthCallback
)

module.exports = router