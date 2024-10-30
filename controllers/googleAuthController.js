const { generateAuthUrl, getUserDataFromCode, verifyAccessToken, refreshIdToken } = require("../services/googleAuthServices")
const { setResponseBody } = require("../utils/responseFormatter")
const userModel = require('../models/userModel')

const getGoogleAuthPageUrl = (request, response) => {
    response.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN_URL)
    response.header('Referrer-Policy', 'no-referer-when-downgrade')

    try {
        const url = generateAuthUrl()
        response.status(200).send(setResponseBody("Url Generated successfully", null, url))
    } 
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
} 

const handleGoogleAuthCallback = async (request, response) => {
    const code = request.query.code

    try {
        const userData = await getUserDataFromCode(code, response)

        response.redirect(`${process.env.CORS_ORIGIN_URL}/google-account-verification`)
    } 
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const verifyToken = async (request, response) => {
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
        const formattedUserData = {
            firstName: userData.given_name,
            lastName: userData.family_name,
            image: userData.picture,
            email: userData.email,
        }

        const existingUser = await userModel.findOne({ email: formattedUserData.email })

        if(!existingUser) {
            const newUser = new userModel({
                accountType: 'google',
                firstName: formattedUserData.firstName,
                lastName: formattedUserData.lastName,
                image: formattedUserData.image,
                email: formattedUserData.email
            })
            await newUser.save()
        }
        
        response.status(200).send(setResponseBody("Data Fetched", null, formattedUserData))
    } catch (error) {

        if (refreshToken) {
            try {
                const newIdToken = await refreshIdToken(refreshToken)
                const newUserData = await verifyAccessToken(newIdToken)
                response.json({ userData: newUserData })
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

module.exports = {
    getGoogleAuthPageUrl,
    handleGoogleAuthCallback,
    verifyToken
}