const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { ACCESS_TOKEN } = require('../configuration/config')
const { profileColors } = require('../configuration/constants')

const userSchema = new mongoose.Schema(
    {
        accountType: {
            type: String,
            enum: ['google', 'email'],
            default: 'email'
        },
        firstName: {
            type: String, 
            required: [true, 'First name is mandatory field'],
            max: 25,
        },
        lastName: {
            type: String, 
            required: [true, 'Last name is mandatory field'],
            max: 25,
        },
        email: {
            type: String, 
            required: [true, 'Email is mandatory field'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String, 
            required: function() {
                return this.signInType === 'email';
            },
            select: false, 
            max: 25,
        },
        image: {
            type: String, 
            // required: true,
        },
        profile: {
            letter: { type: String },
            background: { type: String },
            color: { type: String },
        },
        role: {
            type: String,
            required: true,
            default: 'user',
        }
    }, 
    {
        timestamps: true,
    }, 
    {
        collection: 'users'
    }
)

userSchema.pre('save', function(next) {
    const user = this

    if (!user.profile || !user.profile.letter) {
        const firstLetter = user.firstName.charAt(0).toUpperCase();
        const randomColor = profileColors[Math.floor(Math.random() * profileColors.length)];

        user.profile = {
            letter: firstLetter,
            background: randomColor.background,
            color: randomColor.color,
        };
    }


    if(!user.isModified('password')) return next()
    bcrypt.genSalt(10, (error, salt) => {
        if(error) return next(error)

        bcrypt.hash(user.password, salt, (error, hash) => {
            if(error) return next(error)

            user.password = hash
            next()
        })
    })
})

userSchema.methods.generateAccessJWT = function() {
    let payload = { id : this._id}
    return jwt.sign(payload, ACCESS_TOKEN, {expiresIn: '30d'})
}

module.exports = mongoose.model.users || mongoose.model('users', userSchema)
