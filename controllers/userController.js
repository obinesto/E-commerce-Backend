const UserModel = require ('../models/user.js')
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const GenerateToken = (id)=>{
    return jwt.sign({id},12345,{expiresIn:'4h'})
}

// Create User
const Register = async(req,res)=>{
    const{name,email,password}=req.body
    console.log(req.body)
    // validation
    try {
        if(!name || !email || !password){
            res.status(400).json({msg:'kindly fill all required fields'})
        }
        if(password.length < 8){
            res.status(400).json({msg:'password must not be less than 8 characters'})
        }
        const userParamEmail = await UserModel.findOne({email})
        if(userParamEmail){
            res.status(400).json({msg:'email already exists'})
        }

        // password hashing
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password,salt)
        
        const createdUser = await UserModel.create({
            name:name,
            email:email,
            password:hashedPassword
        })
        if(createdUser){
            const{name, email, password} = createdUser
            return res.status(201).json({msg:createdUser})
        }
    } catch (error) {
        return res.status(500).json(error)
    }
}


module.exports = {Register}