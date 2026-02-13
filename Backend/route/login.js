const express = require('express')
const router = express.Router()
const handleLogin = require('../controller/loginController')

router.post('/',handleLogin)
module.exports = router