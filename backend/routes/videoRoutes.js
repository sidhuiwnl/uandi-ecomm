const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/videoController');

// ADMIN / protected routes should have auth middleware added in production
router.post('/upload', ctrl.uploadReel);
router.get('/', ctrl.getAll);
router.get('/product/:id', ctrl.getProduct);
router.put('/:id', express.json(), ctrl.update); // update title
router.delete('/soft/:id', ctrl.softDelete);
router.delete('/hard/:id', ctrl.hardDelete); // hard remove + r2 delete

router.post('/replace/:id', ctrl.replaceVideo);
module.exports = router;