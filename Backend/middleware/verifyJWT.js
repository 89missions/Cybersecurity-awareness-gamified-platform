require('dotenv').config()
const jwt = require('jsonwebtoken')

const verifyJWT = (req,res,next)=>{
    //get the token..
    const token = req.cookies.accessToken

    //check for the availability of the token
    if(!token){
        return res.status(401).json({"message":"Error.. Try again later.."})
    }

    const verify = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
        if(error){
            console.log(error)
            return res.status(401).json({"message":"Error.... Try again later...."})
        }
        req.user = decoded.username
        next()
    })
    
}

module.exports = verifyJWT