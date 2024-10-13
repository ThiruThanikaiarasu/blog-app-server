const dotenv = require('dotenv')
dotenv.config()

const { PORT, DB_URL, ACCESS_TOKEN, IMAGE_BASE_PATH } = process.env

module.exports = { PORT, DB_URL, ACCESS_TOKEN, IMAGE_BASE_PATH }