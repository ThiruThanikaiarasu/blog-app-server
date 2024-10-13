const multer = require('multer')
const path = require('path')
const fs = require('fs')

const imagesDir = path.join(__dirname, '../public/images')

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function(request, file, callback) {
        callback(null, imagesDir)
    },
    filename: function(request, file, callback) {
        const sanitizedFileName = file.originalname.replace(/\s+/g, '_')
        const fileName = Date.now() + '-' + sanitizedFileName
        callback(null, fileName)
    }
})

const upload = multer({ storage })

module.exports = upload
