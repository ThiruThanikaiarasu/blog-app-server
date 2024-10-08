const express = require('express')
const app = express()

const {PORT} = require('./configuration/config')
const connect = require('./database/connection')
app.get('/', (request, response) => {
    response.status(200).send({ message: "It's working."})
})

connect() 
    .then( () => {
        try{
            app.listen(PORT, console.log(`Server is running at http://localhost:${PORT}`))
        } 
        catch(error) {
            console.log(`Can't connect to database : ${error}`)
        }
    })
    .catch(error => {
        console.log(`Error while connecting to database : ${error}`)
    })