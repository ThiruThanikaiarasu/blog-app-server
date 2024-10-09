const express = require('express')
const router = express.Router()

const { getFileByName } = require('../controllers/imageController')

router.get(
    '/public/images/:filename',
    getFileByName
)

module.exports = router 