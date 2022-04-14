const auth_cookie_key = 'login'
const session_cookie_key = 'ASP.NET_SessionId'

module.exports = {

    parseAuthCookie: function (cookie_header) {
        // Gather the cookies from the header and split them
        if (cookie_header) {
            const rawCookies = cookie_header.split('; ')

            const parsedCookies = {}
            rawCookies.forEach(rawCookie => {
                const parsedCookie = rawCookie.split('=')
                parsedCookies[parsedCookie[0]] = parsedCookie[1]
            })

            return parsedCookies[auth_cookie_key]
        }
    },

    getAuthCookieKey: function () {
        return auth_cookie_key
    },

    getSessionCookieKey: function () {
        return session_cookie_key

    }
}