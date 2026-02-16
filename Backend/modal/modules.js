const mongoose = require('mongoose')
const schema = mongoose.Schema

const modules = new schema({
    name:String,
    description:String,
    icon:String,
    id:String
})

module.exports = mongoose.model('modules',modules)