const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task');

const auth = require('../middleware/auth');

router.post('/create/:id', auth, taskController.create);
router.put('/updatePosition', auth, taskController.updatePosition);
router.put('/update/:id', auth, taskController.update);
router.put('/check/:id', auth, taskController.check);
router.delete('/delete/:id', auth, taskController.delete);

module.exports = router;