const express = require('express')
const router = express.Router()
const getLeaderBoard = require('../controller/leaderboardController')

router.get('/',getLeaderBoard)
module.exports = router