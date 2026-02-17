const mongoose = require('mongoose')
const schema = mongoose.Schema

const user = new schema({
    username:{type:String, required:true},
    password: {type:String, required:true},
    refreshToken: String,
    totalPoints: {type:Number, default:0},
    completedModules: {type:Number,default:0},
    totalModules: {type:Number, default:0},
    rank: {type:String, default:"RECRUIT"},
    badges: [{type:String}],
    unlockedLevels: Number
})

module.exports = mongoose.model('registeredusers',user)