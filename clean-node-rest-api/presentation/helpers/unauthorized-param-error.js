module.exports = class UnauthorizedParamError extends Error{
    constructor () {
        super('Unauthorized')
        this.name = 'UnauthorizedError'
    }
}