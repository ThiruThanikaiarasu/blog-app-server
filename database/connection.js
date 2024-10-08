const  mongoose = require('mongoose')
const { DB_URL } = require('../configuration/config')

const connectToDatabase = async () => {
    const db = await mongoose.connect(DB_URL)
    console.log(`Connected successfully to database : ${db.connection.host}`)
}

module.exports = connectToDatabase