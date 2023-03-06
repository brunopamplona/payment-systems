module.exports = () => {
    router.post('/signup', new SignUpRouter().route)
}

// signup-router
const express = require('express')
const router = express.Router()

class SignUpRouter{
    async route (req, res) {
        const { email, password, repeatPassword } = req.body
        new SignUpUseCase().signUp(email, password, repeatPassword)
        res.status(400).json( {error: 'password don´t watch repeatPassword'})
    }
}

// signup-usecase
class SignUpUseCase {
    async signUp (email, password, repeatPassword) {
        if (password === repeatPassword){
            new AddAcountRepository().add(email, password)
        }
    }
}

// add-aacount-repo
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

class AddAcountRepository{
    async add (email, password, repeatPassword) {
        const user = await AccountModel.create({ email, password})
        return user
    }
}