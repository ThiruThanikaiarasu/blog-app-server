const oAuth2Client = require('../configuration/googleOAuthConfig')

const generateAuthUrl = () => {
    const scopes = ['openid', 'profile', 'email']
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
        prompt: 'consent',
        scope: scopes
    })
}

const getUserDataFromCode = async (code, response) => {
    try {
        const { tokens } = await oAuth2Client.getToken(code)

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        }
        response.cookie('access_token', tokens.access_token, options)
        response.cookie('refresh_token', tokens.refresh_token, options)
        response.cookie('id_token', tokens.id_token, options)

        return await fetchUserData(tokens.access_token)
    } catch (error) {
        throw new Error('Failed to get user data')
    }
}


const fetchUserData = async (accessToken) => {
    try {
        const response = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        )

        if (!response.ok) {
            throw new Error(`Error fetching user data: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        data.accessToken = accessToken
        return data
    } catch (error) {
        throw new Error("Failed to fetch user data")
    }
}

const verifyAccessToken = async (idToken) => {
    try {
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        return payload
    } catch (error) {
        throw new Error('Invalid access token')
    }
}

const refreshIdToken = async (refreshToken) => {
    try {
        const response = await fetch('https://your-auth-provider.com/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        })

        if (!response.ok) {
            throw new Error('Failed to refresh ID token')
        }

        const data = await response.json()
        return data.id_token
    } catch (error) {
        throw error
    }
}

module.exports = {
    generateAuthUrl,
    getUserDataFromCode,
    verifyAccessToken,
    refreshIdToken
}