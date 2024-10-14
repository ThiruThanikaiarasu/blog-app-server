const userModel = require('../models/userModel')
const initialData = require('../database/initialData')
const cloudinary = require('../configuration/cloudinaryConfig')
const streamifier = require('streamifier')

const bcrypt = require('bcryptjs')

const signup = async (request, response) => {
    const {firstName, lastName, email, password} = request.body

    try{
        const existingUser = await userModel.findOne({email})
        if(existingUser) {
            return response.status(409).send({ message: 'Email id already exist' })
        }
        
        let imageURL = ''
        if(request.file) {
            console.log(request.file)
            try {
                const uploadImage = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "blog-app",          
                            use_filename: true,           
                            unique_filename: false,      
                        },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );

                    streamifier.createReadStream(request.file.buffer).pipe(stream);
                });
                imageURL = uploadImage.secure_url
            }
            catch(error) {
                console.error('Cloudinary upload error:', error)
                return response.status(500).send({ message: 'Image upload failed' })
            }
        } else {
            return response.status(400).send({ message: "Error while uploading image, try again later"})
        }

        const userToBeRegistered = new userModel({firstName, lastName, email, password, image: imageURL})

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