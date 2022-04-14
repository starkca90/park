const express = require('express')
const {validationResult} = require('express-validator')
const utils_cookie = require('../api-v1/services/cookie/cookie')
const parkonect = require('../api-v1/services/parkonect/parkonect')
const parkonectErrors = require('../api-v1/services/parkonect/parkonectErrors')

const router = express.Router()

router.get('/', (req, res) => {

    const auth_cookie_value = utils_cookie.parseAuthCookie(req.headers.cookie)

    if (auth_cookie_value) {
        let credentials = Buffer.from(auth_cookie_value, 'base64').toString('ascii').split(':')
        // Our auth cookie was sent in the request, let's make sure it is still valid
        parkonect.attemptAuth(credentials[0], credentials[1]).then(r => {
            // No issues were encountered, credentials must still be valid
            // Send the user to the search page
            res.render('search', {
                title_description: 'Search',
                data: r
            })
        }).catch(error => {
            if (error instanceof parkonectErrors.AuthError) {
                // Cookie seems to be invalid, get rid of it
                res.clearCookie(utils_cookie.getAuthCookieKey())
                console.log(error)
                // Send the user to the authentication page
                res.redirect('/')
            } else {
                console.log(error)
                res.send(error)
            }
        })
    } else
        // Our auth cookie was not in the request, send user to the authentication page
        res.render('authentication', {title_description: 'Authentication'})
})

router.post('/',
    (req, res) => {

        // console.log(req.body)

        console.log('Login POST Received')

        const errors = validationResult(req)

        if (errors.isEmpty()) {


            parkonect.attemptAuth(req.body.username, req.body.password, req.body.remember === 'on').then(r => {
                if (r.result) {
                    // Login was a success
                    if (r.credentials) {
                        // User asked to remember them, add a cookie
                        res.cookie(utils_cookie.getAuthCookieKey(), r.credentials)
                        delete r.credentials
                    }
                    res.render('search', {
                        title_description: 'Search',
                        data: r
                    })
                } else {
                    res.render('authentication',
                        {
                            title_description: 'Authentication',
                            errors: 'Username or Password incorrect',
                            data: req.body
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