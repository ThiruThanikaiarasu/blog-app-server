const dotenv = require('dotenv')
dotenv.config()

const { PORT, DB_URL, ACCESS_TOKEN } = process.env

module.exports = { PORT, DB_URL, ACCESS_TOKEN }