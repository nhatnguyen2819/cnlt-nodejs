const express = require('express');
const router = express.Router();
const blogPostController = require('../controllers/blogPostController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PNG'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.get('/', blogPostController.index);
router.get('/new', blogPostController.createForm);
router.post('/store', upload.single('image'), blogPostController.store);
router.get('/edit/:id', blogPostController.editForm);
router.post('/update/:id', upload.single('image'), blogPostController.update);
router.post('/delete/:id', blogPostController.delete);
router.get('/:id', blogPostController.show);

module.exports = router;
