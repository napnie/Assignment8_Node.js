const express = require('express')
const router = express.Router()

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Bring in models
let Article = require('../models/articles.js')

// Edit Article
router.get('/edit/:id', (req, res) => {
    // console.log(req.params.id);
    
    Article.findById(req.params.id, (err, article) => {
        res.render('edit_article', {
            title: 'Edit Article : ' + article.title,
            article: article
        })
    })
})

// Update submit POST Route 
router.post('/edit/:id', (req, res) => {
    let new_article = {}
    new_article.title = req.body.title
    new_article.author = req.body.author
    new_article.body = req.body.body
    let query = {_id:req.params.id}

    Article.updateOne(query, new_article ,(err) => {
        if(err) {
            console.log(err)
            return
        } else {
            req.flash('success', 'Article Updated')
            res.redirect('/')
        }
    })
})

// Add Route
router.get('/add', (req, res) => {
    res.render('add_articles', {
        title:'Add Article'
    })
})

// Add Submit POST Route
router.post('/add', [
        check('title').isLength({min:1}).trim().withMessage('Title required'),
        check('author').isLength({min:1}).trim().withMessage('Author required'),
        check('body').isLength({min:1}).trim().withMessage('Body required')
], (req,res,next)=>{

    let article = new Article({
        title:req.body.title,
        author:req.body.author,
        body:req.body.body
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        res.render('add_articles', { 
            article:article,
            errors: errors.mapped()
        });
    } else {
        article.title = req.body.title;
        article.author = req.body.author;
        article.body = req.body.body;

        article.save(err=>{
            if(err)throw err;
            req.flash('success','Article Added');
            res.redirect('/');
        });
    }
});

// Get Single Article
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('articles', {
            article: article
        })
    })
})

// Delete Article
router.delete('/:id', (req, res) => {
    let query = {_id:req.params.id}

    Article.deleteOne(query, (err) => {
        if(err) {
            console.log(err)
        }
        req.flash('success', 'Deleted Article')
        res.send('Success');
    })
})

module.exports = router