const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-param-error')
const ServerError = require('../helpers/server-error')

const makeSut = () => {
    const emailValidatorSpy = makeEmailValidator()
    const authUseCaseSpy = makeAuthUseCase()
    
    authUseCaseSpy.accessToken = 'valid_token'
    
    const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
    
    return {
        sut,
        authUseCaseSpy,
        emailValidatorSpy
    }
}

const makeAuthUseCase = () => {
    class AuthUseCaseSpy{
        auth (email, password) {
            this.email = email
            this.password = password
            return this.accessToken
        }
    }
    return new AuthUseCaseSpy()
}
const makeAuthUseCaseWithError = () => {
    class AuthUseCaseSpy {
        auth() {
            throw new Error()
        }
    }
    return new AuthUseCaseSpy()
}
const makeEmailValidator = () => {
    class EmailValidatorSpy {
        isValid (email){
            this.email = email
            return this.isEmailValid
        }
    }
    const emailValidatorSpy = new EmailValidatorSpy()
    emailValidatorSpy.isEmailValid = true
    return emailValidatorSpy
}
const makeEmailValidatorWithError = () => {
    class EmailValidatorSpy {
        isValid() {
            throw new Error()
        }
    }
    return new EmailValidatorSpy()
}
describe('Login Router', () => {
    test('Should return 400 if no email is provided', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                password: 'any-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })
    test('Should return 400 if no password is provided', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                email: 'any-email@gmail.com'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })
    test('Should return 500 if no httpRequest is provided', async () => {
        const { sut } = makeSut()
        
        const httpResponse = await sut.route()
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should return 500 if httpRequest has no body', async () => {
        const { sut } = makeSut()
        const httpRequest = {}
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should call AuthUseCase with correct params', async () => {
        const { sut, authUseCaseSpy } = makeSut()
        const httpRequest = {
            body: {
                email: 'any-email@mail.com',
                password: 'any-password'
            }
        }
        await sut.route(httpRequest)
        expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
        expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
    })
    test('Should call EmailValidator with correct email', async () => {
        const { sut, emailValidatorSpy } = makeSut()
        const httpRequest = {
            body: {
                email: 'any-email@mail.com',
                password: 'any-password'
            }
        }
        await sut.route(httpRequest)
        expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
    })
    test('Should return 401 when invalid credentials are provided', async () => {
        const { sut, authUseCaseSpy } = makeSut()
        authUseCaseSpy.accessToken = null
        const httpRequest = {
            body: {
                email: 'wrong-email@mail.com',
                password: 'wrong-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(401)
        expect(httpResponse.body).toEqual(new UnauthorizedError())
    })
    test('Should return 200 when valid credencials are provided', async () => {
        const { sut, authUseCaseSpy } = makeSut() 
        authUseCaseSpy.accessToken = 'valid_token'
        const httpRequest = {
            body: {
                email: 'valid-email@mail.com',
                password: 'valid-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(200)
        expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)

    })
    test('Should return 500 if no AuthUseCase is provided', async () => {
        const sut = new LoginRouter()
        const httpRequest = {
            body: {
                email: 'any-email@mail.com',
                password: 'any-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should return 500 if no AuthUseCase has no auth method', async () => {
        class AuthUseCaseSpy{}
        const authUseCaseSpy = new AuthUseCaseSpy()
        const sut  = new LoginRouter(authUseCaseSpy)
        const httpRequest = {
            body: {
                email: 'any-email@mail.com',
                password: 'any-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should return 500 if no AuthUseCase throws an error', async () => {
       
        const authUseCaseSpy = makeAuthUseCaseWithError()
        const sut  = new LoginRouter(authUseCaseSpy)
        const httpRequest = {
            body: {
                email: 'any-email@mail.com',
                password: 'any-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
      
    })
    test('Should return 500 if no EmailValidator is provided', async () => {
        const authUseCaseSpy = makeAuthUseCase()
        const sut = new LoginRouter(authUseCaseSpy)
        const httpRequest = {
            body: {
                email: 'any-email@mail.com',
                password: 'any-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should return 500 if no EmailValidator has no isValid method', async () => {
        const authUseCaseSpy = makeAuthUseCase()
        const sut = new LoginRouter(authUseCaseSpy, {})
        const httpRequest = {
            body: {
                email: 'any-email@mail.com',
                password: 'any-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    }) 
    test('Should return 500 if no EmailValidator throws an error', async () => {
       
        const authUseCaseSpy = makeAuthUseCase()
        const emailValidatorSpy = makeEmailValidatorWithError()

        const sut  = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
        const httpRequest = {
            body: {
                email: 'any-email@mail.com',
                password: 'any-password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
      
    })

})