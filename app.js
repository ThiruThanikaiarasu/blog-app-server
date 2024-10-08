const express = require('express')
const app = express()

const {PORT} = require('./configuration/config')

app.listen(PORT, console.log(`Server is running at http://localhost:${PORT}`))