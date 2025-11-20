const express = require('express');
const router = express.Router();
const blogCtrl = require('../controllers/blogController');

// Public
router.get('/', blogCtrl.getAll);
router.get('/slug/:slug', blogCtrl.getBySlug);

// Admin
// router.use(protect, admin);
router.post('/', blogCtrl.create);
router.put('/:id', blogCtrl.update);
router.delete('/:id', blogCtrl.delete);
router.patch('/:id/hide', blogCtrl.toggleHide);
router.get('/:id', blogCtrl.getById);

module.exports = router;