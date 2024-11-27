const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const createHttpError = require('http-errors')
const {roles} = require('../utils/constants');
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: [roles.admin, roles.moderator, roles.client],
        default: roles.client,
    },
    status: {
        type: Boolean,
        default: true,   
    }
})

UserSchema.pre('save', async function(next){
    try{
        if(this.isNew){
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(this.password, salt)
            this.password = hashedPassword;
            if(this.email == process.env.ADMIN_EMAIL.toLowerCase()){
                this.role = roles.admin
                console.log('admin')
            }
            
        }
        
        next()

    }catch(e){
        next(e)
    }
})

UserSchema.methods.isValidPassword = async function(password){
    try{
        return await bcrypt.compare(password, this.password)
    }catch(e){
        throw createHttpError.InternalServerError(e.message)
    }
}

const User = mongoose.model('user', UserSchema)

module.exports = User;