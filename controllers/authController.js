const userModel = require('../models/userModel')
const initialData = require('../database/initialData')

const bcrypt = require('bcryptjs')

const signup = async (request, response) => {
    const {firstName, lastName, email, password} = request.body
    const {filename} = request.file

    try{
        const existingUser = await userModel.findOne({email})
        if(existingUser) {
            return response.status(409).send({ message: 'Email id already exist' })
        }
        const image = 'images/' + filename
        const userToBeRegistered = new userModel({firstName, lastName, email, password, image})

        await userToBeRegistered.save()
        const {password: userPassword, _id: userId, ...userData} = userToBeRegistered?._doc

        let options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
        const token = userToBeRegistered.generateAccessJWT()
        response.cookie('SessionID', token, options)
        response.status(201).send({ message: 'User created successfully', userData})
    } 
    catch(error) {
        response.status(500).send({ message: error.message})
    }
}

const login = async (request, response) => {
    const allUserData = await userModel.find()
    if(allUserData.length == 0) {
        const initialUser = new userModel(initialData)
        await initialUser.save()
    }    

    const {email} = request.body 
    try{
        const existingUser = await userModel.findOne({ email }).select('+password') 
        if(!existingUser) {
            return response.status(401).send({ message: 'Invalid email address' })
        }

        const validatePassword = await bcrypt.compare(`${request.body.password}`, existingUser.password)
        if(!validatePassword) {
            return response.status(401).send({ message: 'Invalid password' })
        }

        const {password, _id, createdAt, __v, updatedAt, ...userData} = existingUser?._doc

        let options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
        const token = existingUser.generateAccessJWT()     
        response.cookie('SessionID', token, options)
        response.status(200).send({ message: 'Login Successfully', userData: userData })
    } 
    catch(error) {
        response.status(500).send({ message: error.message })
    }
}

const logout = async (request, response) => {
    const authHeader = request.headers['cookie']
    try {
        if(!authHeader){
            return response.status(204).send({ message: 'No Content' })
        }
    
        const cookie = authHeader.split('=')[1]
        const accessToken = cookie.split(';')[0]
    
        response.setHeader('Clear-Site-Data', '"cookies"')
        response.status(200).send({ message: "Logged out!" })
    }
    catch(error) {
        response.status(500).send({ message: error.message })
    }
    
}

module.exports = {
    signup,
    login,
    logout
}