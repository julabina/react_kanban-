const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

const auth = require('../middleware/auth');

router.post('/create', userController.create);
router.post('/login', userController.login);
router.put('/toggleDarkmod', auth, userController.toggleDarkmod);

module.exports = router;