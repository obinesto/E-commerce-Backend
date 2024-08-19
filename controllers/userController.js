const UserModel = require ('../models/user.js')

// Create User
const Register = async(req,res)=>{
    res.send('Registration Successful!')
}


module.exports = {Register}