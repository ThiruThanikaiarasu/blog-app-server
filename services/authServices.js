const moment = require('moment')

const otpModel = require("../models/otpModel")
const OtpError = require('../errors/OtpError')
const { OTP_EXPIRY_MINUTES, MAX_ATTEMPTS } = require('../configuration/constants')


const generateOtp = async (email, session) => {

    let existingOtp = await checkForExistingOtp(email)

    if (existingOtp) {
        if (existingOtp.attempts >= MAX_ATTEMPTS) {
            throw new OtpError("Too many attempts", 429)
        } 

        return await updateOtp(existingOtp, session)
    } 

    return await createOtp(email, session) 
}

const createOtp = async (email, session) => {
    const otp = generateRandomOtp()
    const expiresAt = moment().add(OTP_EXPIRY_MINUTES, 'minutes').toDate()

    const otpData = {
        email, 
        otp, 
        expiresAt, 
        attempts: 1, 
    }

    await otpModel.create([otpData], {session})

    return otp
}

const updateOtp = async (otpDocument, session) => {
    const otp = generateRandomOtp()
    
    otpDocument.otp = otp
    otpDocument.expiresAt = moment().add(OTP_EXPIRY_MINUTES, 'minutes').toDate()
    otpDocument.attempts += 1

    await otpDocument.save({session})

    return otp
}

const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const checkForExistingOtp = async (email) => {
    return await otpModel.findOne({ email })
}

const getOtpDataByEmail = async (email) => {
    const otpData = await otpModel.findOne({ email })

    return otpData
}

module.exports = {
    generateOtp,
    getOtpDataByEmail
}
