const mongoose = require('mongoose')
const schema = mongoose.Schema

const user = new schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    refreshToken: String,

    totalPoints: { type: Number, default: 0 },
    completedModulesList: { type: [String], default: [] },
    totalModules: { type: Number, default: 0 },

    answeredQuestions: [{
        questionId: String,
        moduleId: String,
        answeredAt: { type: Date, default: Date.now },
        wasCorrect: Boolean
    }],

    rank: { type: String, default: "RECRUIT" },
    badges: [{ type: String }],
    unlockedLevels: Number
})

// Login lookups
user.index({ username: 1 }, { unique: true })

// Refresh token lookup
user.index({ refreshToken: 1 })

// Leaderboard queries
user.index({ totalPoints: -1 })

// Rank-based queries
user.index({ rank: 1 })

module.exports = mongoose.model('registeredusers', user)