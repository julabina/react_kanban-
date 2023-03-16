const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task');

const auth = require('../middleware/auth');

router.post('/create/:id', auth, taskController.create);
router.put('/updatePosition', auth, taskController.updatePosition);

module.exports = router;