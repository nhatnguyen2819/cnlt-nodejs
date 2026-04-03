const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.home);
router.get('/list', pageController.list);
router.get('/contact', pageController.contact);
router.get('/about', pageController.about);
router.get('/detail/:id', pageController.detail);

module.exports = router;
