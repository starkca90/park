const wrapper = require('axios-cookiejar-support').wrapper
const tough = require('tough-cookie')
const axios = require('axios')
const HTMLParser = require('node-html-parser')
const ParkonectErrors = require('./parkonectErrors')
const utils_cookie = require('../cookie/cookie')

module.exports = {
    attemptSessionRefresh: async function (session_cookie) {
        const jar = new tough.CookieJar()
        const client = wrapper(axios.create({jar}))

        // Add the provided session cookie to the cookie jar
        const cookie = tough.Cookie.parse(`${utils_cookie.getSessionCookieKey()}=${session_cookie}; Domain=secure.parkonect.com; path=/;`)
        jar.setCookie(cookie, 'https://secure.parkonect.com')

        let viewstate, eventvalidation

        // This is a new session, get a new set of session tokens
        let response = await client.get('https://secure.parkonect.com/ValidatorStep2.aspx')
            .catch(function (error) {
                throw new ParkonectErrors.ParkonectError(error)
            })

        // Other session/state tokens are in the form itself, parse the returned body to find our required values
        let validatorForm = HTMLParser.parse(response.data).querySelector('form')

        if (!validatorForm)
            throw new ParkonectErrors.ParkonectError(response, 'Authentication Form Not Found')

        // If we authenticated, the form will be asking for a barcode. If that input is present,
        // authentication worked
        const result = validatorForm.querySelector('#ctl00_cph_body_txt_barcode') !== null

        viewstate = validatorForm.querySelector('#__VIEWSTATE').getAttribute('value')
        eventvalidation = validatorForm.querySelector('#__EVENTVALIDATION').getAttribute('value')

        return {
            'result': result,
            'viewstate': viewstate,
            'eventvalidation': eventvalidation,
            'session_cookie': session_cookie
        }
    },

    attemptAuth: async function (username, password, remember = false) {
        const jar = new tough.CookieJar()
        const client = wrapper(axios.create({jar}))

        let viewstate, eventvalidation, sessionCookie = ''

        // This is a new session, get a new set of session tokens
        let response = await client.get('https://secure.parkonect.com/validator.aspx')
            .catch(function (error) {
                throw new ParkonectErrors.ParkonectError(error)
            })

        // One session token is a cookie, go grab that
        response.headers['set-cookie'].forEach(cookie => {
            if (cookie.indexOf(utils_cookie.getSessionCookieKey()) !== -1)
                sessionCookie = cookie.split(';')[0].split('=')[1]
        })

        if (!sessionCookie)
            throw new ParkonectErrors.AuthError(response.headers, 'Unable to find ASP.NET_SessionId Cookie')

        // Other session/state tokens are in the form itself, parse the returned body to find our required values
        let validatorForm = HTMLParser.parse(response.data).querySelector('form')

        if (!validatorForm)
            throw new ParkonectErrors.ParkonectError(response, 'Authentication Form Not Found')

        viewstate = validatorForm.querySelector('#__VIEWSTATE').getAttribute('value')
        eventvalidation = validatorForm.querySelector('#__EVENTVALIDATION').getAttribute('value')

        // Form the auth body with the now available required items
        const body = new URLSearchParams()
        body.append('__VIEWSTATE', viewstate)
        // From testing, this parameter is always empty, but if it is not included, the server breaks
        body.append('__VIEWSTATEENCRYPTED', null)
        body.append('__EVENTVALIDATION', eventvalidation)
        body.append('ctl00$cph_body$txt_username', username)
        body.append('ctl00$cph_body$txt_password', password)
        body.append('ctl00$cph_body$btn_submit', 'Log In')

        response = await client.post('https://secure.parkonect.com/validator.aspx', body,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .catch(function (error) {
                throw new ParkonectErrors.ParkonectError(error)
            })

        // We need to get a new viewstate and eventvalidation token and we also need to
        // make sure the authentication worked
        validatorForm = HTMLParser.parse(response.data).querySelector('form')

        if (!validatorForm)
            throw new ParkonectErrors.ParkonectError(response, 'Authentication Form Not Found')

        // If we authenticated, the form will be asking for a barcode. If that input is present,
        // authentication worked
        const result = validatorForm.querySelector('#ctl00_cph_body_txt_barcode') !== null

        // Grab the next set of state tokens
        viewstate = validatorForm.querySelector('#__VIEWSTATE').getAttribute('value')
        eventvalidation = validatorForm.querySelector('#__EVENTVALIDATION').getAttribute('value')

        let res = {
            'result': result,
            'viewstate': viewstate,
            'eventvalidation': eventvalidation,
            'session_cookie': sessionCookie
        }

        if (remember)
            res.credentials = Buffer.from(username + ':' + password).toString('base64')

        return res
    },

    ticketSearch: async function (ticket, viewstate, eventvalidation, session_cookie) {
        const jar = new tough.CookieJar()
        const client = wrapper(axios.create({jar}))

        // Add the provided session cookie to the cookie jar
        const cookie = tough.Cookie.parse(`${utils_cookie.getSessionCookieKey()}=${session_cookie}; Domain=secure.parkonect.com; path=/;`)
        jar.setCookie(cookie, 'https://secure.parkonect.com')

        // Build the search body
        const body = new URLSearchParams()
        body.append('__VIEWSTATE', viewstate)
        // From testing, this parameter is always empty, but if it is not included, the server breaks
        body.append('__VIEWSTATEENCRYPTED', null)
        body.append('__EVENTVALIDATION', eventvalidation)
        // Parkonect renamed the barcode field to txt_filter... Neat
        body.append('ctl00$cph_body$txt_filter', ticket)

        // Parkonect now has the ability to search by various types (Last name, license plate...) 
        // 1 Indicate barcode, what we have
        body.append('ctl00$cph_body$ddlFilterList', '1')
        body.append('ctl00$cph_body$btn_search', 'Submit')

        

        let response = await client.post('https://secure.parkonect.com/ValidatorStep2.aspx', body,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .catch(function (error) {
                throw new ParkonectErrors.ParkonectError(error)
            })

        const validatorForm = HTMLParser.parse(response.data).querySelector('form')

        if (!validatorForm)
            throw new ParkonectErrors.ParkonectError(response, 'Form Not Found')

        // If we found a valid ticket, we shouldn't be asking for a barcode
        const result = validatorForm.querySelector('#ctl00_cph_body_txt_barcode') === null

        const check_in_message = validatorForm.querySelector('#ctl00_cph_body_lbl_message').text

        let codes = []

        if (result) {
            const options = validatorForm.querySelector('#ctl00_cph_body_ddl_validations').getElementsByTagName('option')

            options.forEach(option => {
                let code = {}
                code.value = option.getAttribute('value')
                code.description = option.text
                codes.push(code)
            })
        }

        // Grab the next set of state tokens
        viewstate = validatorForm.querySelector('#__VIEWSTATE').getAttribute('value')
        eventvalidation = validatorForm.querySelector('#__EVENTVALIDATION').getAttribute('value')

        return {
            'result': result,
            'check_in': check_in_message,
            'codes': codes,
            'viewstate': viewstate,
            'eventvalidation': eventvalidation,
            'session_cookie': session_cookie
        }

    },

    ticketValidate: async function (validation, viewstate, eventvalidation, session_cookie) {
        const jar = new tough.CookieJar()
        const client = wrapper(axios.create({jar}))

        // Add the provided session cookie to the cookie jar
        const cookie = tough.Cookie.parse(`${utils_cookie.getSessionCookieKey()}=${session_cookie}; Domain=secure.parkonect.com; path=/;`)
        jar.setCookie(cookie, 'https://secure.parkonect.com')

        // Build the search body
        const body = new URLSearchParams()
        body.append('__VIEWSTATE', viewstate)
        // From testing, this parameter is always empty, but if it is not included, the server breaks
        body.append('__VIEWSTATEENCRYPTED', null)
        body.append('__EVENTVALIDATION', eventvalidation)
        body.append('ctl00$cph_body$ddl_validations', validation)
        body.append('ctl00$cph_body$btn_submit', 'Submit')

        let response = await client.post('https://secure.parkonect.com/ValidatorStep2.aspx', body,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .catch(function (error) {
                throw new ParkonectErrors.ParkonectError(error)
            })

        const validatorForm = HTMLParser.parse(response.data).querySelector('form')

        if (!validatorForm)
            throw new ParkonectErrors.ParkonectError(response, 'Form Not Found')

        // If validation was succesfull, a message should be telling of as such
        const message = validatorForm.querySelector('#ctl00_cph_body_lbl_message').text
        const result = message.includes('Record updates successfully!')

        // Grab the next set of state tokens
        viewstate = validatorForm.querySelector('#__VIEWSTATE').getAttribute('value')
        eventvalidation = validatorForm.querySelector('#__EVENTVALIDATION').getAttribute('value')

        return {
            'result': result,
            'message': message,
            'viewstate': viewstate,
            'eventvalidation': eventvalidation,
            'session_cookie': session_cookie
        }
    }
}