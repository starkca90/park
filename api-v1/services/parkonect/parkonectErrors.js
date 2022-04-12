class ParkonectError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

class AuthError extends ParkonectError {
    constructor(message = '') {
        super('Error encountered during authentication')
        this.data = {message}
    }
}

class SearchError extends ParkonectError {
    constructor(message = '') {
        super('Error encountered during search')
        this.data = {message}
    }
}

class ValidationError extends ParkonectError {
    constructor(message = '') {
        super('Error encountered during validation')
        this.data = {message}
    }
}

module.exports = {
    ParkonectError,
    AuthError,
    SearchError,
    ValidationError
}