module.exports = class ServerError extends Error{
    constructor () {
        super(`Generic Server Error`)
        this.name = 'ServerError'
    }
}