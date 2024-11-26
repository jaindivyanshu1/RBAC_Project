const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const User = require('../models/user.model')


passport.use(
    new localStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done)=>{
        try{
            const user = await User.findOne({email});
            if(!user){
                return done(null, false, {message: 'Email not found'})
            }

            const isMatch = await user.isValidPassword(password)
            
            if(isMatch){
                return done(null, user)
                
            }else{
                return done(null, false, {message: "Incorrect Password"})
            }

        }catch(error){
            done(error)
        }
    })
);

passport.serializeUser(function (user, done){
    done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});



