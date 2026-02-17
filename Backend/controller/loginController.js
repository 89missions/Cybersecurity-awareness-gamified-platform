const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const registeredusers = require('../modal/regsiteredusers')
const modules = require('../modal/modules')

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
        if(!compare){
            return res.status(401).json({"message":"invalid password or username.."})
        }else{
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

            //check for the total number of modules in the db..
            const count = await modules.countDocuments()

            //update the count to the registereduser
            foundUser.totalModules = count

            const update = await foundUser.save() //so with this , anytime the userlogs in, the total number gets updated if there has been a new addition to the module..

            //console.log(accessToken)
            //sending it as a cookie and json res for the refreshToken and accessToken respectively to the client..
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: false,              // false for localhost
                sameSite: 'lax',            // or 'strict'
                maxAge: 24 * 60 * 60 * 1000, // 24 hours (not 15 minutes!)
                path: '/',                   // Available on all paths
                domain: 'localhost'          // Explicit domain
            });
            
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/',
                domain: 'localhost'
            });

            return res.sendStatus(200)
        }
        
    } catch (error) {
        console.log('login error', error)
        res.status(500).json({"message":"internal server error"})
    }
}
module.exports = handleLogin