const express = require('express')
const app = express()
const path = require('path')

const cors = require('cors')
const cookieParser = require('cookie-parser')

const {PORT, CORS_ORIGIN_URL} = require('./configuration/config')
const connect = require('./database/connection')

const userRoute = require('./routes/userRoute')
const blogRoute = require('./routes/blogRoute')
const googleAuthRoute = require('./routes/googleAuthRoute')
const authRoute = require('./routes/authRoute')

app.use(cors({
    origin: CORS_ORIGIN_URL, 
    credentials: true
}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true}))
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (request, response) => {
    response.status(200).send({ message: "It's working."})
})

app.use('/api/v1/user', userRoute)
app.use('/api/v1/blog', blogRoute)
app.use('/api/v1/google-auth', googleAuthRoute)
app.use('/api/v1/auth', authRoute)

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