const express = require('express')
const router = express.Router()
const {getQuestions,getNextQuestions} = require('../controller/questionController')

router.get('/:moduleId',getQuestions)
router.get('/questions/next/:moduleId', getNextQuestions);

module.exports = router