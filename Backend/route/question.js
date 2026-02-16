const express = require('express')
const router = express.Router()
const getQuestions = require('../controller/questionController')

router.get('/:id',getQuestions)

module.exports = router