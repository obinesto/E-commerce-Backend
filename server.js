const express = require('express')
const env = require('dotenv').config()
const mongoose = require('mongoose')
const Route = require ('./Routes/userRoute.js')

// Initialize express as an app
const App = express()

const myPort = process.env.PORT

// middleware
App.use(express.json())
App.use(express.urlencoded({extended:false}))

App.get('/',(req,res) =>{
    res.status(200).json('Home Page')
})

// route middleware
App.use('/v1/api/user', Route)


// connecting to momgodb database
mongoose.connect(process.env.DB_URL)
.then(()=>{
    App.listen(myPort,()=>{
        console.log(`server now running on ${myPort}`)
    })
})
.catch((err)=>{
    console.log(err)
})