const ParkonectErrors = require('../services/parkonect/parkonectErrors')

module.exports = function (parkonectService) {
    let operations = {
        POST
    }

    function POST(req, res) {
        console.log('Login POST Received')

        parkonectService.attemptAuth(req.body.username, req.body.password).then(r => {
            if (r.result) {
                res.status(200)
                res.send(r)
            } else {
                res.status(401)
                res.send()
            }
        })


    }

    POST.apiDoc = {
        summary: "Attempts to authenticate with provided username and password",
        operationId: "postAuth",
        consumes: ["application/json"],
        parameters: [
            {
                in: "body",
                name: "authentication",
                schema: {
                    $ref: "#/definitions/AuthRequest"
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