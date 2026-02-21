const express = require('express');
const router = express.Router();
const { getQuestions } = require('../controller/questionController');

// This MUST be GET and accept query params
router.get('/:moduleId', getQuestions);

module.exports = router;