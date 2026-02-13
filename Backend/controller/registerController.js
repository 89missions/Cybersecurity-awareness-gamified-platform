const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const registeredusers = require('../modal/regsiteredusers')

const handleRegistration = async (req,res)=>{
    try{
        const {userName,password} = req.body
        //make sure to receive the userName and password from the body
        if(!userName || !password){
           return res.status(400).json({"message":"Missing Credentials"})
        }
    
        //does userName already exists in the system
        const duplicate = await registeredusers.findOne({username:userName})
    
        //if duplicate found
        if(duplicate){
           return res.status(400).json({"message":"Username already taken"})
        }

        //if duplicate not found, hash the password.
        const hashedPassword = await bcrypt.hash(password,10)
    
        //add the qualified user to the registeredUsers collection
        const createdUser = await registeredusers.create({
            username:userName,
            password:hashedPassword
        })
        return res.status(200).json({"message":"successfully created a user..",createdUser})
    }catch(error){
        console.log(error)
    }
}
module.exports = handleRegistration