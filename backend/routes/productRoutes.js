// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product routes
router.get('/', productController.getAllProducts);

// Tag routes
router.get("/tags", productController.getAllTags);


router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Variant routes
router.post('/variants', productController.createVariant);
router.put('/variants/:id', productController.updateVariant);
router.patch('/variants/:id/stock', productController.updateStock);
router.delete('/variants/:id', productController.deleteVariant);

// Image routes
router.post('/images', productController.addProductImage);
router.delete('/images/:id', productController.deleteProductImage);

router.put('/images/:id', productController.updateProductImage);




module.exports = router;
