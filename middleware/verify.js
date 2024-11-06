const jwt = require('jsonwebtoken')
const { ACCESS_TOKEN } = require('../configuration/config')
const userModel = require('../models/userModel')
const { verifyToken } = require('../controllers/googleAuthController')
const { verifyAccessToken, refreshIdToken } = require('../services/googleAuthServices')

const conditionalVerify = (request, response, next) => {
    try{
        const authHeader = request.headers['cookie']
        if(authHeader) {
            return verifyUser(request, response, next)
        }

        next()
    }
    catch(error) {
        response.status(500).send({ message: error.message })
    }
}

const verifyUser = async (request, response, next) => {
    try {
        const authHeader = request.headers['cookie']
        if(authHeader && authHeader.includes('id_token')) {
            const email = await verifyIdTokenFromGoogle(request, response)
            const existingUser = await userModel.findOne({ email })
            request.user = existingUser
            return next()
        }
        if(!authHeader){
            return response.status(401).send({ message: 'Token not found' })
        }

        const cookie = authHeader.split('=')[1]

        jwt.verify(cookie, ACCESS_TOKEN, async (error, decoded) => {
            if(error) {
                return response.status(401).json({ message:'Session expired' })
            }           
            const {id} = decoded
            const existingUser = await userModel.findById({_id: id})
            const password = existingUser?._doc?.password
            if(password) {
                const {password, ...data} = existingUser?._doc
                request.user = data
                return next()
            } else {
                request.user = existingUser
                return next()
            }
        })
    }
    catch(error) {
        return response.status(500).json({ message: error.message })
    }
}

const verifyIdTokenFromGoogle = async (request, response) => {
    const cookieString = request.headers['cookie']
    const parseCookies = (cookieString) => {
        if (!cookieString) {
            return {}
        }

        const cookies = cookieString.split('; ').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=')
            acc[key] = decodeURIComponent(value)
            return acc
        }, {})

        return {
            accessToken: cookies.access_token || null,
            refreshToken: cookies.refresh_token || null,
            idToken: cookies.id_token || null,
        }
    }

    const { accessToken, refreshToken, idToken } = parseCookies(cookieString)


    if (!accessToken) {
        return response.status(401).send('No access token provided')
    }

    try {
        const userData = await verifyAccessToken(idToken)
        return userData.email
    } catch (error) {

        if (refreshToken) {
            try {
                const newIdToken = await refreshIdToken(refreshToken)
                const newUserData = await verifyAccessToken(newIdToken)
                return response.json({ userData: newUserData })
            } catch (refreshError) {
                return response
                    .status(401)
                    .send('Invalid access token and refresh token')
            }
        } else {
            return response
                .status(401)
                .send('Invalid access token and no refresh token provided')
        }
    }
}

const verifyAmin = (request, response, next) => {
    try{
        const {role} = request.user
        if(role != 'admin') {
            return response.status(401).json({ message: 'Unauthorized access' })
        }
        next()
    }
    catch(error) {
        response.status(500).json({ message: error.message })
    }
    
}

module.exports = {
    conditionalVerify,
    verifyUser,
    verifyAmin
}