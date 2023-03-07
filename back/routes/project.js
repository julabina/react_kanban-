const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project');

const auth = require('../middleware/auth');

router.post('/create', auth, projectController.create);
router.get('/getAll/:id', auth, projectController.getAll);

module.exports = router;