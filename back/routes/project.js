const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project');

const auth = require('../middleware/auth');

router.post('/create', auth, projectController.create);

module.exports = router;