const jwt = require("jsonwebtoken")

const key = process.env.JWT_KEY

const generateToken = (id)=>{
    return jwt.sign(id, key, {expiresIn: "7d"})
}

module.exports = generateToken