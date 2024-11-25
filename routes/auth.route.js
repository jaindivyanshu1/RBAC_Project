const router = require('express').Router()
const User = require('../models/user.model')

router.get('/login', async (req, res, next) => {
    res.render('login')
})

router.post('/login', async (req, res, next) => {
    res.send('Login Post')
})

router.get('/register', async (req, res, next) => {
    // res.render('register', {messages})
    res.render('register')
})

router.post('/register', async (req, res, next) => {
    try{
        const {email} = req.body;
        const doesExist = await User.findOne({email})
        if(doesExist){
            res.redirect('/auth/register')
            return
        }
        const user = new User(req.body)
        await user.save();
        res.send(user)
    }
    catch(e){
        next(e);
    }
})

router.post('/logout', async (req, res, next) => {
    res.send('Logout')
})
module.exports = router