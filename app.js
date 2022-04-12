const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const {initialize} = require('express-openapi')
const swaggerUi = require('swagger-ui-express')

const v1ParkonectService = require('./api-v1/services/parkonectService')
const v1ApiDoc = require('./api-v1/api-doc')

const app = express();

app.listen(3030)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// OpenAPI Routes
initialize({
    app,
    apiDoc: v1ApiDoc,
    dependencies: {
        parkonectService: v1ParkonectService,
    },
    errorMiddleware: function (err, req, res) {
        console.error(err)
        res.status(err.status).send(err.errors)
    },
    paths: "./api-v1/paths"
})

// OpenAPI UI
app.use(
    "/api-documentation",
    swaggerUi.serve,
    swaggerUi.setup(null, {
        swaggerOptions: {
            url: "http://localhost:3030/v1/api-docs",
            explorer: true
        }
    })
)

module.exports = app;