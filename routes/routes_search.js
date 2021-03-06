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


            parkonect.ticketSearch(req.body.ticket, req.body.viewstate, req.body.eventvalidation, req.body.session_cookie).then(r => {
                if (r.result) {
                    // A result was found
                    res.render('validate', {
                        title_description: 'Validate',
                        message: r.check_in,
                        data: r
                    })
                } else {
                    // Ticket was not found
                    res.render('search', {
                        title_description: 'Search',
                        message: 'The barcode entered was not found\r\nPlease try again.',
                        data: r
                    })
                }
            }).catch(err => {
                console.error(err)
                res.send(err.data.message)
            })
        } else
            res.render('authentication',
                {
                    title_description: 'Authentication',
                    errors: errors.array(),
                    data: req.body
                })
    })

module.exports = router;