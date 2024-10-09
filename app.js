const express = require('express')
const app = express()

const cors = require('cors')
const cookieParser = require('cookie-parser')

const {PORT} = require('./configuration/config')
const connect = require('./database/connection')

const userRoute = require('./routes/userRoute')
const blogRoute = require('./routes/blogRoute')
const imageRoute = require('./routes/imageRoute')

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: false}))
app.use(express.json())


app.get('/', (request, response) => {
    response.status(200).send({ message: "It's working."})
})

app.use('/api/v1/user', userRoute)
app.use('/api/v1/blog', blogRoute)
app.use('/api/v1', imageRoute)

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