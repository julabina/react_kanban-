const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project');

const auth = require('../middleware/auth');

router.get('/getAll/:id', auth, projectController.getAll);
router.get('/getOne/:id', auth, projectController.getOne);
router.post('/create', auth, projectController.create);
router.put('/updateProject/:id', auth, projectController.updateProject);
router.delete('/deleteProject/:id', auth, projectController.deleteProject);

module.exports = router;