const express = require('express')
const router = express.Router()
const handleSubmission = require('../controller/submitController')

router.post('/',handleSubmission)
module.exports = router