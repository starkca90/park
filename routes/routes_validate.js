const express = require('express')
const {validationResult} = require('express-validator')
const utils_cookie = require('../api-v1/services/cookie/cookie')
const parkonect = require('../api-v1/services/parkonect/parkonect')
const parkonectErrors = require('../api-v1/services/parkonect/parkonectErrors')

const router = express.Router()

router.get('/', (req, res) => {
    const session_cookie_value = utils_cookie.parseSessionCookie(req.headers.cookie)

    if (session_cookie_value) {
        parkonect.attemptSessionRefresh(session_cookie_value).then(r => {
            console.log(r)
            if (r.result) {
                res.render('search', {
                    title_description: 'Search',
                    data: r
                })
            } else {
                res.clearCookie(utils_cookie.getSessionCookieKey())
                res.redirect('/')
            }
        })
    } else
        res.redirect('/')
})

router.post('/',
    (req, res) => {

        // console.log(req.body)

        console.log('Search POST Received')

        const errors = validationResult(req)

        if (errors.isEmpty()) {


            parkonect.ticketValidate(req.body.validation_code, req.body.viewstate, req.body.eventvalidation, req.body.session_cookie).then(r => {
                if (r.result) {
                    // A result was found
                    res.render('result', {
                        title_description: 'Success',
                        message: 'Record updated successfully!',
                        data: r
                    })
                } else {
                    // Error encountered validating
                    res.render('result', {
                        title_description: 'Failed',
                        message: r.message,
                        data: r
                    })
                }
            }).catch(err => {
                console.error(err)
                res.send(err.data.message)
            })
        } else
            res.render('search',
                {
                    title_description: 'Search',
                    errors: 'An error was encountered. Please try again',
                    data: req.body
                })
    })

module.exports = router;