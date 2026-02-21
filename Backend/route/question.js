const express = require('express');
const router = express.Router();
const { getQuestions } = require('../controllers/questionController');

// This one endpoint handles ALL question fetching with pagination
router.get('/:moduleId', getQuestions);

module.exports = router;