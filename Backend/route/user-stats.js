const express = require('express')
const router = express.Router()
const getUserStats = require('../controller/user-Stats-Controller')

router.get('/',getUserStats)

module.exports = router
