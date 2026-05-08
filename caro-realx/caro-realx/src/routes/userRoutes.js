const router = require('express').Router();
const { getOrCreateUser, getUserStats } = require('../controllers/userController');

router.post('/login', getOrCreateUser);
router.get('/:username', getUserStats);

module.exports = router;
