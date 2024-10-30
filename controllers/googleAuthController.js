const { generateAuthUrl, getUserDataFromCode } = require("../services/googleAuthServices")
const { setResponseBody } = require("../utils/responseFormatter")

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

        response.redirect(process.env.CORS_ORIGIN_URL)
    } 
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

module.exports = {
    getGoogleAuthPageUrl,
    handleGoogleAuthCallback
}