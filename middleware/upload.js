const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function(request, file, callback) {
        callback(null, path.join(__dirname, '../public/images'))
    },
    filename: function(request, file, callback) {
        const sanitizedFileName = file.originalname.replace(/\s+/g, '_')
        const fileName = Date.now() + '-' + sanitizedFileName
        callback(null, fileName)
    }
})

const upload = multer({ storage })

module.exports = upload
