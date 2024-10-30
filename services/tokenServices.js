const generateToken = (user) => {
    return user.generateAccessJWT() 
}

const setTokenCookie = (response, token) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }
    response.cookie('SessionID', token, options)
}

module.exports = {
    generateToken,
    setTokenCookie
}
