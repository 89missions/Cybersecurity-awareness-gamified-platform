const express = require('express')
const router = express.Router()
const handleRegistration = require('../controller/registerController')

router.post('/',handleRegistration)
module.exports = router