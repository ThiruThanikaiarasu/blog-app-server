const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const { setResponseBody } = require('../utils/responseFormatter')
const { findUserByEmailWithPassword, findUserByEmail, createUser } = require('../services/userServices')
const { generateToken, setTokenCookie } = require('../services/tokenServices')
const { generateOtp, getOtpDataByEmail } = require('../services/authServices')
const { sendOtpThroughEmail } = require('../services/emailServices')
const OtpError = require('../errors/OtpError')
const EmailError = require('../errors/EmailError')


const signup = async (request, response) => {
    const { firstName, lastName , email, password } = request.body

    try{
        const existingUser = await findUserByEmail(email)
        if(existingUser) {
            return response.status(409).send(setResponseBody("Email id already exist", "existing_email", null))
        }
        const newUser = {
                    firstName, 
                    lastName, 
                    email, 
                    password, 
            }
        
        const userToBeRegistered = await createUser(newUser)

        const token = generateToken(userToBeRegistered)
        setTokenCookie(response, token)

        const {password: userPassword, __v: userVersion, _id: userId, ...userData} = userToBeRegistered._doc
        response.status(201).send(setResponseBody("User Created Successfully", null, userData))
    } 
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const login = async (request, response) => {
    const { email, password } = request.body 
    try{
        const existingUser = await findUserByEmailWithPassword(email)
        if(!existingUser) {
            return response.status(401).send(setResponseBody("Invalid email address", "invalid_email", null))
        }

        const validatePassword = await bcrypt.compare(password, existingUser.password)
        if(!validatePassword) {
            return response.status(401).send(setResponseBody("Invalid password", "invalid_password", null))
        }

        let options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
        const {password: _, _id, role, __v, tenantId, ...userData} = existingUser._doc

        const token = existingUser.generateAccessJWT()     
        response.cookie('SessionID', token, options)
        response.status(200).send(setResponseBody("Logged in Successfully", null, userData))
    } 
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const logout = async (request, response) => {
    const authHeader = request.headers['cookie']
    try {
        if(!authHeader){
            return response.status(204).send({ message: 'No Content' })
        }
    
        response.setHeader('Clear-Site-Data', '"cookies"')
        response.status(200).send({ message: "Logged out!" })
    }
    catch(error) {
        response.status(500).send({ message: error.message })
    }
    
}

const sendSignupVerificationCode = async (request, response) => {
    const { email } = request.body

    const session = await mongoose.startSession()
    
    try {
        session.startTransaction()

        const existingUser = await findUserByEmail(email)
        if (existingUser) {
            await session.abortTransaction()
            session.endSession()

            return response.status(409).send(setResponseBody("Email id already exists", "existing_email", null))
        }

        const otp = await generateOtp(email, session)
        await sendOtpThroughEmail(email, otp)

        await session.commitTransaction()
        session.endSession()

        response.status(200).send(setResponseBody("OTP sent.", null, null))
    }
    catch(error) {

        if (error instanceof OtpError) {
            return response.status(error.statusCode).send(setResponseBody(error.message, "otp_error", null)) 
        } 

        if(error instanceof EmailError) {
            return response.status(error.statusCode).send(setResponseBody(error.message, "email_error", null))
        }

        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const verifyOtp = async (request, response) => {
    const { email, otp } = request.body
    try {
        const otpData = await getOtpDataByEmail(email)

        if(!otpData) {
            return response.status(410).send(setResponseBody("OTP expired. Request new one.", "otp_expired", null))
        }

        if(otpData.otp.toString() !== otp.toString()) {
            return response.status(401).send(setResponseBody("Incorrect PIN", "verification_failed", null))
        }

        response.status(200).send(setResponseBody("Verification successful", null, null))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "An unexpected error occurred.", null))
    }
}

module.exports = {
    signup,
    login,
    logout,
    sendSignupVerificationCode,
    verifyOtp
}
