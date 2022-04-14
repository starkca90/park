const express = require('express')
const {validationResult} = require('express-validator')
const utils_cookie = require('../api-v1/services/cookie/cookie')
const parkonect = require('../api-v1/services/parkonect/parkonect')
const parkonectErrors = require('../api-v1/services/parkonect/parkonectErrors')

const router = express.Router()

router.get('/', (req, res) => {
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
                    if (r.credentials) {
                        // User asked to remember them, add a cookie
                        res.cookie(utils_cookie.getAuthCookieKey(), r.credentials)
                        delete r.credentials
                    }
                    res.render('validate', {
                        title_description: 'Validate',
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