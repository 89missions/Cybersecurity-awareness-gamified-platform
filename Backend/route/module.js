const express = require('express')
const router = express.Router()
const {getallModules,getspecificModule} = require('../controller/moduleController')

router.get('/',getallModules)
router.get('/:id',getspecificModule)
module.exports = router