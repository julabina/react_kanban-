const express = require('express');
const router = express.Router();
const columnController = require('../controllers/column');

const auth = require('../middleware/auth');

router.post('/create/:id', auth, columnController.create);
router.get('/getAll/:id', auth, columnController.getAll);
router.put('/update', auth, columnController.update);
router.put('/updatePosition', auth, columnController.updatePosition);
router.delete('/delete/:id', auth, columnController.delete);

module.exports = router;