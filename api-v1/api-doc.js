const apiDoc = {
    swagger: "2.0",
    basePath: "/v1",
    info: {
        title: "Provides centralized access to cdwpark functionality",
        version: "1.0.0"
    },
    definitions: {
        AuthRequest: {
            type: "object",
            properties: {
                username: {
                    description: "User's Username",
                    type: "string"
                },
                password: {
                    description: "User's password",
                    type: "string"
                }
            }
        },

        TicketSearch: {
            type: "object",
            properties: {
                ticket: {
                    description: "Ticket number to search for",
                    type: "string"
                },
                viewstate: {
                    description: "Required __VIEWSTATE parameter",
                    type: "string"
                },
                eventvalidation: {
                    description: "Required __EVENVALIDATION parameter",
                    type: "string"
                },
                session_cookie: {
                    description: "Required ASP.NET_SessionId cookie value",
                    type: "string"
                }
            }
        }
    },
    paths: {}
}

module.exports = apiDoc