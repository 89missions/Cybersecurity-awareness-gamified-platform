const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const registeredusers = require('../modal/regsiteredusers')

const handleLogin = async (req,res)=>{

    try {
        const {userName,password} = req.body
        //check if it comes with the req..
        if(!userName || !password){
           return res.status(401).json({"message":"missing Credentials"})
        }
        //check if the user is a registered user...
        const foundUser = await registeredusers.findOne({username:userName})
        //if not found
        if(!foundUser){
           return res.status(400).json({"message":"invalid username or password"})
        }

        //compare passwords of the found user
           const compare = await bcrypt.compare(password,foundUser.password)
        if(compare){
            //now create jwt for the user..
            const accessToken = jwt.sign({
                username:userName
            },process.env.ACCESS_TOKEN_SECRET,{
                expiresIn:'15m'
            })
            const refreshToken = jwt.sign({
                username:userName
            },process.env.REFRESH_TOKEN_SECRET,{
                expiresIn:'2d'
            })

            //add to the user..
            foundUser.refreshToken = refreshToken
            const result = await foundUser.save()

            //sending it as a cookie and json res for the refreshToken and accessToken respectively to the client..
            res.cookie('refreshToken',refreshToken,{
                httpOnly: true, 
                secure: false,
                sameSite: 'Lax', 
                maxAge: 24 * 60 * 60 * 1000
            })
            res.cookie('accessToken',accessToken,{
                httpOnly: true, 
                secure: false,
                sameSite: 'Lax', 
                maxAge: 15*60*1000
            })
            return res.sendStatus(200)
        }
        
    } catch (error) {
        
    }
}
module.exports = handleLogin