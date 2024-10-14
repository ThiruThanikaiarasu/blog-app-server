const multer = require('multer')
const path = require('path')
const fs = require('fs')

// const uploadDir = path.join('/tmp', 'public', 'images')
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true })
// }

// const storage = multer.diskStorage({
//     destination: function(request, file, callback) {
//         callback(null, uploadDir)
//     },
//     filename: function(request, file, callback) {
//         const sanitizedFileName = file.originalname.replace(/\s+/g, '_')
//         const fileName = Date.now() + '-' + sanitizedFileName
//         callback(null, fileName)
//     }
// })


const storage = multer.memoryStorage();
const upload = multer({ storage })

module.exports = upload
