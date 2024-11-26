const router = require('express').Router()
const User  = require('../models/user.model')
const mongoose = require('mongoose')


router.get('/users', async (req, res, next) =>{
    try{
        const users = await User.find()
        // res.send(users);
        res.render('manage-users', {users})
    }catch(e){
        next(e)
    }
})

router.get('/user/:id', async (req, res, next) => {
    try {
        const {id} = req.params
        if(!mongoose.Types.ObjectId.isValid(id)){
            req.flash('error', 'Invalid ID')
            res.redirect('/admin/users')
            return
        }

        const person = await User.findById({id})
        res.render('profile', {person})
    }catch(e){
        next(e)
    }
})


module.exports = router