const ParkonectErrors = require('../services/parkonect/parkonectErrors')

module.exports = function (parkonectService) {
    let operations = {
        POST
    }

    function POST(req, res) {
        console.log('Ticket POST Received')

        parkonectService.ticketSearch(req.body.ticket, req.body.viewstate, req.body.eventvalidation, req.body.session_cookie).then(r => {
            if (r.result) {
                res.status(200)
                res.send(r)
            } else {
                res.status(404)
                res.send(r)
            }
        })


    }

    POST.apiDoc = {
        summary: "Search for the requested ticket",
        operationId: "postTicket",
        consumes: ["application/json"],
        parameters: [
            {
                in: "body",
                name: "ticket",
                schema: {
                    $ref: "#/definitions/TicketSearch"
                }
            }
        ],
        responses: {
            200: {
                description: "All Good"
            }
        }
    }

    return operations
}