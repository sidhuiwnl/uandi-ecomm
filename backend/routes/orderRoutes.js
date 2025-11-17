const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create new order
router.post('/create', orderController.createOrder);

// Get order by ID
// router.get('/:orderId', orderController.getOrder);

router.get("/getOrders/:userId",orderController.getUserOrders)

module.exports = router;