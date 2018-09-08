const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const flash = require('connect-flash')
const session = require('express-session')

const passport = require('passport')
const config = require('./config/database')

mongoose.connect(config.database)
let db = mongoose.connection

// Check connecttion
db.once('open', () => {
    console.log('Connected to MongoDB')
})

// Test for DB error
db.on('error', (err) => {
    console.log(err)
})

// Init
const app = express()

// Bring in models
let Article = require('./models/articles.js')

// Load View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false ,useNewUrlParser: true}))
// parse application/json
app.use(bodyParser.json())

// Set Public folder
app.use(express.static(path.join(__dirname, 'public')))

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    // ,
    // cookie: { secure: true }
  }))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport)
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if(err) {
            console.log(err)
            return
        } else {
            res.render('index', {
                title:'Articles',
                articles: articles
            })
        }
    })
})

// Route Files
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles', articles)
app.use('/users', users)

// Start Server
app.listen(3000, () => {
    console.log('Server start on port 3000...');
})