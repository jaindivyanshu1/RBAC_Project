const router = require('express').Router()
const passport = require('passport')
const User = require('../models/user.model')
const {body, validationResult} = require('express-validator')


router.get('/login', async (req, res, next) => {
    res.render('login')
})

router.post('/login', passport.authenticate('local',{
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}))

router.get('/register', async (req, res, next) => {
    // res.render('register', {messages})
    res.render('register')
})

router.post('/register', [
    body('email').trim().isEmail().withMessage('Email must be a valid email').normalizeEmail().toLowerCase(),
    body('password').trim().isLength(8).withMessage('Password Length is too short, please use atleast 8 character'),
    body('password2').custom((value, {req})=>{

        if(value != req.body.password) {
            throw new Error('Password do not match');
        }

        return true

    })
],async (req, res, next) => {
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            errors.array().forEach(error =>{
                req.flash('error', error.msg)
            })
            res.render('register', {email: req.body.email, messages: req.flash()})
            return;
        }
        const {email} = req.body;
        const doesExist = await User.findOne({email})
        if(doesExist){
            res.redirect('/auth/register')
            return
        }
        const user = new User(req.body)
        await user.save();
        // res.send(user)
        req.flash('success', `${user.email} register successfuly, you can now login for the service`)
        res.redirect('/auth/login')
    }
    catch(e){
        next(e);
    }
})




router.get('/logout', async (req, res, next) => {
    req.logOut(err => {
        if (err) {
            return next(err); // Handle errors during logout
        }
        res.redirect('/'); // Redirect to the home page after successful logout
    });
});




module.exports = router