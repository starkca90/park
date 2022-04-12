const parkonect = require('./parkonect/parkonect')

const parkonectService = {

    async attemptAuth(username, password) {
        return await parkonect.attemptAuth(username, password)
    },

    async ticketSearch(ticket, viewstate, eventvalidation, session_cookie) {
        return await parkonect.ticketSearch(ticket, viewstate, eventvalidation, session_cookie)
    }

}

module.exports = parkonectService