const LocalStrategy = require('passport-local').Strategy
const User = require('../models/users')
// const config = require('../config/database')
const bcrypt = require('bcryptjs')

module.exports = function(passport) {
    // Local Strategy
    passport.use(new LocalStrategy( (username, password, done) => {
        let query = {username: username}
        User.findOne(query, (err, user) => {
            if(err) {
                throw err
            }
            if(!user) {
                return done(null, false, {message:'Invalid user/password'})
            }

            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err
                if(isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, {message:'Invalid user/password'})
                }
            } )
        })
    }))

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}