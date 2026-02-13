require('dotenv').config()
const mongoose = require('mongoose')

const connectDb = async()=>{
    try{
        mongoose.connect(process.env.Db_URI)
    }catch(error){
        console.log(error)
    }
} 
module.exports = connectDb