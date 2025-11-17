// routes/addresses.js
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// 🟢 Get all addresses for user
router.get('/user/:user_id', addressController.getAddressesByUser);

// 🟢 Get single address
router.get('/:id', addressController.getAddressById);

// 🟢 Get default address for user
router.get('/default/:user_id', addressController.getDefaultAddress);

// 🟢 Create new address
router.post('/', addressController.createAddress);

// 🟢 Update address
router.put('/:id', addressController.updateAddress);

// 🟢 Set default address
router.patch('/set-default', addressController.setDefaultAddress);

// 🟢 Delete address (soft delete)
router.delete('/:id', addressController.deleteAddress);

// 🟢 Restore address (admin)
router.patch('/:id/restore', addressController.restoreAddress);

module.exports = router;