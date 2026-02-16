const mongoose = require('mongoose')
const schema = mongoose.Schema

const question = new schema({
    question: String,
    description: String,
    options: {
        A: { text: String, isCorrect: Boolean, reason: String },
        B: { text: String, isCorrect: Boolean, reason: String },
        C: { text: String, isCorrect: Boolean, reason: String },
        D: { text: String, isCorrect: Boolean, reason: String }
    },
    moduleId: String,
    id: String
})

module.exports = mongoose.model('questions', question)