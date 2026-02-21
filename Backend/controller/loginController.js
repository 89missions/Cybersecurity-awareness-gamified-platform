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

            //check for the total number of modules in the db..
            const count = await modules.countDocuments()

            //update the count and refreshToken to the registereduser
            foundUser.refreshToken = refreshToken
            foundUser.totalModules = count

            const update = await foundUser.save()

            //sending it as a cookie and json res for the refreshToken and accessToken respectively to the client..
            const isProduction = process.env.NODE_ENV === 'production';

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: isProduction,       
                sameSite: isProduction ? 'none' : 'lax', 
                maxAge: 7 * 24 * 60 * 1000,
                path: '/',
            });
            
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });

            return res.status(200).json({"message":"loggedIn successfully"})
        }
        
    } catch (error) {
        console.log('login error', error)
        res.status(500).json({"message":"internal server error"})
    }
}
module.exports = handleLogin