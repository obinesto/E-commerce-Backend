const {Register} = require('../controllers/userController')
const express = require ('express')

const Route = express.Router()

Route.post('/register', Register)

module.exports = Route