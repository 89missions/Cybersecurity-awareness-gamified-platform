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

// Fast lookup of questions within a module
question.index({ moduleId: 1 })

// Fast lookup of a specific question
question.index({ id: 1 }, { unique: true })

// Best for your current query pattern
question.index({ moduleId: 1, id: 1 })

module.exports = mongoose.model('questions', question)