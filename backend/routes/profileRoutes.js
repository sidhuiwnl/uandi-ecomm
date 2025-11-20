const express = require('express');
const router = express.Router();
// const auth = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profileController');

router.get('/me', profileController.getProfile);
router.put('/me', profileController.updateProfile);
router.post('/me/photo', profileController.uploadPhotoStream);

module.exports = router;
