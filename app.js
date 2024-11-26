const express = require('express')
const createHttpError = require('http-errors')
const { default: mongoose } = require('mongoose')
const morgan = require('morgan')
const path = require('path')

require('dotenv').config()

const session = require('express-session')
const connectFlash = require('connect-flash')
const passport = require('passport')
const MongoStore = require('connect-mongo');
const connectEnsure = require('connect-ensure-login')


const app = express()


app.use(morgan('dev'));

app.set('view engine', 'ejs');
// app.use(express.static('pubic'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

// session

// const MongoStore = connnectMongo(session)

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
        // secure: true //only for https
        httpOnly: true
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // Connection string to MongoDB
        dbName: process.env.DB_NAME,    // Optional: specify DB name
    }),
}));
// for passport JS auth
app.use(passport.initialize())
app.use(passport.session())
require('./utils/passport.auth');

app.use((req, res, next)=>{
    res.locals.user = req.user
    next()
})

app.use(connectFlash());
app.use((req, res, next)=>{
    res.locals.messages = req.flash();
    next();
})


app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));
app.use('/user', ensureAuthenticated, require('./routes/user.route'));

app.use((req, res, next)=>{
    next(createHttpError.NotFound())
});

app.use((error, req, res, next)=>{
    error.status = error.status || 500
    res.status(error.status)
    res.render('error_40x', {error})
    // res.send(error)
})

const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
    // useNewUrlParser: true,
    // useUnifiedTopology: true
}).then(()=>{
    console.log('📚 Connected to MongoDB')
    app.listen(PORT, ()=> console.log(`🚀 on port ${PORT}
do Ctrl+Click (👉) on http://localhost:3000 (😈)`))
}).catch(err=>console.log(err.message));

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect('/auth/login');
    }
}

