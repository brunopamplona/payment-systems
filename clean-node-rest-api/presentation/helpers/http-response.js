const MissingParamError = require('./missing-param-error')
const UnauthorizedParamError = require('./unauthorized-param-error')
const ServerError = require('./server-error')

module.exports = class httpResponse {
    static badRequest (paramName) {
        return {
            statusCode: 400,
            body: new MissingParamError(paramName)
        }
    }
    static serverError () {
        return {
            statusCode: 500,
            body: new ServerError()
        }
    }
    static unauthorizedError () {
        return {
            statusCode: 401,
            body: new UnauthorizedParamError()
        }
    }
    static ok (data) {
        return {
            statusCode: 200,
            body: data
        }
    }
}
