const UserModel = require ('../models/user.js')
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const userModel = require('../models/user.js');

const GenerateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_KEY,{expiresIn:'4h'})
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
        const Token = GenerateToken(createdUser._id)
        res.cookie('token', Token,{
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now()+1000 * 86400),
            sameSite: 'none',
            secure: true
        })
        if(createdUser){
            const{name, email, password} = createdUser
            return res.status(201).json({msg:createdUser, Token})
        }
    } catch (error) {
        return res.status(500).json(error)
    }
}

// log user in
const logUserIn = async (req, res) =>{
    const {email,password} = req.body
    console.log(req.body)
    try {
        if(!email || !password){
            return res.status(400).json({msg:'please add email and password'})
        }
        const userExist = await userModel.findOne({email})
        if(!userExist){
            return res.status(400).json({msg:'user not found. Please register'})
        }
        const isPasswordCorrect = await bcrypt.compare(password, userExist.password)
        const Token = GenerateToken(userExist._id)
        res.cookie('token', Token,{
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now()+1000 * 86400),
            sameSite: 'none',
            secure: true
        })
        if(userExist && isPasswordCorrect){
            const {_id, name, email} = userExist
            res.status(200).json({msg: { _id, name, email}, Token})
        }
    } catch (error) {
        return res.status(500).json({msg: 'invalid user'})
    }
}

// log user out
const logUserOut = async(req,res)=>{
    res.cookie('token', '',{
        path: '/',
        httpOnly: true,
        expires: new Date(0), // for mobile, it is advisable to delete the token instead
        sameSite: 'none',
        secure: true
})
return res.status(200).json({msg: 'logout successful'})
}





module.exports = {Register, logUserIn, logUserOut}