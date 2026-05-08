const router = require('express').Router();
const { getRecentMatches } = require('../controllers/matchController');
router.get('/', getRecentMatches);
module.exports = router;
