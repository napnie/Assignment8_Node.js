const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')

const { check, validationResult } = require('express-validator/check');

const passport = require('passport')

// Bring in models
let User = require('../models/user.js')

// Register Form
router.get('/register', (req, res) => {
    res.render('Register')
})

// Register Process
router.post('/register', [
    check('name').isLength({min:1}).trim().withMessage('Name required'),
    check('email').isLength({min:1}).trim().withMessage('Email required'),
    check('email').isEmail().trim().withMessage('Email is not valid'),
    check('username').isLength({min:1}).trim().withMessage('Username required'),
    check('password').isLength({min:1}).trim().withMessage('Password required')
], (req, res, next) => {
    
    check('password2').custom( (value, {req, loc, path}) => {
        if(value != req.body.password) {
            throw new Error("Passwords do not match");
        } else {
            return value
        }
    } )

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    })

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors);
        res.render('register', {
            user:user,
            errors: errors.mapped()
        })
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                if(err) {
                    console.log(err);
                } 
                user.password = hash
                user.save( (err) => {
                    if(err) {
                        console.log(err)
                        return 
                    }
                    req.flash('success', 'Registation Complete')
                    res.redirect('/users/login')
                })
            })
        })
        
    }
})

// Login form
router.get('/login', (req, res) => {
    res.render('login')
})

// Login Process
router.post('/login', (req, res, next) => {
    console.log('You post');
    
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

module.exports = router