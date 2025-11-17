// backend/controllers/productController.js
const productModel = require('../models/productModel');
const pool = require("../config/database")

const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const rows = await productModel.getAllProducts();

      const productsMap = new Map();

      rows.forEach(row => {
        // Create product if not already in map
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
            main_image: row.image_url || null, // keep as is
            variants: []
          });
        }

        const product = productsMap.get(row.product_id);

        // Handle variants
        if (row.variant_id) {
          let variant = product.variants.find(v => v.variant_id === row.variant_id);
          if (!variant) {
            variant = {
              variant_id: row.variant_id,
              variant_name: row.variant_name,
              sku: row.sku,
              mrp_price: row.mrp_price,
              price: row.price,
              gst_percentage: row.gst_percentage,
              gst_included: row.gst_included,
              gst_amount: row.gst_amount,
              final_price: row.final_price,
              stock: row.stock,
              weight: row.weight,
              unit: row.unit,
              images: [] // ✅ initialize images array
            };
            product.variants.push(variant);
          }

          // Handle variant images
          if (row.image_id && row.image_variant_id === row.variant_id) {
            const imageExists = variant.images.some(img => img.image_id === row.image_id);
            if (!imageExists) {
              variant.images.push({
                image_id: row.image_id,
                image_url: row.image_url,
                is_main: row.is_main
              });
            }
          }
        }
      });

      const products = Array.from(productsMap.values());
      res.json({ success: true, data: products });
    } catch (error) {
      console.error("Error in getAllProducts:", error);
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
    const [result] = await pool.query(
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
