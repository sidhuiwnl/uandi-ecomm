const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.post("/validate",couponController.validateCoupon);

router.post("/available", couponController.getAvailableCouponsController);


module.exports = router;