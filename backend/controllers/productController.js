// backend/controllers/productController.js
const productModel = require('../models/productModel');

const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const rows = await productModel.getAllProducts();
      
      // Group products with their variants
      const productsMap = new Map();
      
      rows.forEach(row => {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            product_id: row.product_id,
            product_name: row.product_name,
            description: row.description,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            category: {
              category_id: row.category_id,
              category_name: row.category_name
            },
            main_image: row.image_url,
            variants: []
          });
        }
        
        if (row.variant_id) {
          const product = productsMap.get(row.product_id);
          const variantExists = product.variants.some(v => v.variant_id === row.variant_id);
          
          if (!variantExists) {
            product.variants.push({
              variant_id: row.variant_id,
              variant_name: row.variant_name,
              sku: row.sku,
              mrp_price: row.mrp_price,
              price: row.price,
              gst_percentage: row.gst_percentage,
              final_price: row.final_price,
              stock: row.stock,
              weight: row.weight,
              unit: row.unit
            });
          }
        }
      });
      
      const products = Array.from(productsMap.values());
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const product = await productModel.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create product
  createProduct: async (req, res) => {
    try {
      const result = await productModel.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product_id: result.insertId }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      await productModel.updateProduct(req.params.id, req.body);
      res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      await productModel.deleteProduct(req.params.id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Variant operations
  createVariant: async (req, res) => {
    try {
      const result = await productModel.createVariant(req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Variant created successfully',
        data: { variant_id: result.insertId }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateVariant: async (req, res) => {
    try {
      await productModel.updateVariant(req.params.id, req.body);
      res.json({ success: true, message: 'Variant updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { stock } = req.body;
      await productModel.updateStock(req.params.id, stock);
      res.json({ success: true, message: 'Stock updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteVariant: async (req, res) => {
    try {
      await productModel.deleteVariant(req.params.id);
      res.json({ success: true, message: 'Variant deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Image operations
  addProductImage: async (req, res) => {
    try {
      const result = await productModel.addProductImage(req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Image added successfully',
        data: { image_id: result.insertId }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateProductImage: async (req, res) => {
  try {
    const { image_url, is_main } = req.body;
    const [result] = await db.query(
      'UPDATE product_images SET image_url = ?, is_main = ? WHERE image_id = ?',
      [image_url, is_main, req.params.id]
    );
    res.json({ success: true, message: 'Image updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
},

  deleteProductImage: async (req, res) => {
    try {
      await productModel.deleteProductImage(req.params.id);
      res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAllTags: async (req, res) => {
    try {
      const tags = await productModel.getAllTags();

      if (!tags || tags.length === 0) {
        return res.status(404).json({ success: false, message: 'No tags found' });
      }

      res.json({ success: true, data: tags });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = productController;
