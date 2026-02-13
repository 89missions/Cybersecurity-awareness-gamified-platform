const mongoose = require('mongoose')
const schema = mongoose.Schema

const user = new schema({
    username:{type:String, required:true},
    password: {type:String, required:true},
    refreshToken: String,
    points: Number,
    badges: [{type:String}],
    unlockedLevels: Number
})

module.exports = mongoose.model('registeredusers',user)