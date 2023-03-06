module.exports = class MissingParamError extends Error{
    constructor () {
        super(`Missing parameter`)
        this.name = 'MissingParamError'
    }
}