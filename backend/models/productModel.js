// backend/models/productModel.js
const pool = require('../config/database');

const productModel = {
  // Get all products with category and variants
  getAllProducts: async () => {
    const query = `
      SELECT
        p.product_id, p.product_name, p.description, p.is_active,
        p.created_at, p.updated_at,
        c.category_id, c.category_name,
        v.variant_id, v.variant_name, v.sku, v.mrp_price, v.price,
        v.gst_percentage, v.gst_included, v.gst_amount, v.final_price,
        v.stock, v.weight, v.unit,
        pi.image_id, pi.image_url, pi.is_main, pi.variant_id AS image_variant_id
      FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             LEFT JOIN variants v ON p.product_id = v.product_id
             LEFT JOIN product_images pi ON v.variant_id = pi.variant_id
      ORDER BY p.created_at DESC;
    `;
    const [rows] = await pool.query(query);
    return rows;
  },


  // Get product by ID with full details
  getProductById: async (id) => {
    const productQuery = `
      SELECT
        p.*,
        c.category_name,
        t.tag_name
      FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             LEFT JOIN tags t ON p.tag_id = t.tag_id
      WHERE p.product_id = ?
    `;

    const [product] = await pool.query(productQuery, [id]);

    if (product.length === 0) return null;

    const [variants] = await pool.query(
        'SELECT * FROM variants WHERE product_id = ?',
        [id]
    );

    const [mainImage] = await pool.query(
        'SELECT * FROM product_images WHERE product_id = ?',
        [id]
    );

    const [variantImages] = await pool.query(
        'SELECT * FROM product_images WHERE product_id = ? AND variant_id IS NOT NULL',
        [id]
    );

    const variantsWithImages = variants.map(variant => ({
      ...variant,
      images: variantImages.filter(img => img.variant_id === variant.variant_id)
    }));

    return {
      ...product[0],
      variants: variantsWithImages,
      main_image: mainImage.length > 0 ? mainImage : null
    };
  },


  // Create product
  createProduct: async (data) => {
    const { category_id, tag_id, product_name, description, is_active } = data;

    const [result] = await pool.query(
        'INSERT INTO products (category_id, tag_id, product_name, description, is_active) VALUES (?, ?, ?, ?, ?)',
        [category_id, tag_id, product_name, description, is_active !== undefined ? is_active : true]
    );

    return result;
  },


  // Update product
  updateProduct: async (id, data) => {
    console.log("Update model reachable", id, data);
    let { category_id, product_name, description, is_active, tag_id } = data;

    if (tag_id === '') {
      console.log("Setting tag_id to null");
      tag_id=null
    }
    
    const [result] = await pool.query(
      'UPDATE products SET category_id = ?, product_name = ?, description  = ?, is_active = ?, tag_id = ? WHERE product_id = ?',
      [category_id, product_name, description, is_active, tag_id, id]
    );
    return result;
  },

  // Delete product
  deleteProduct: async (id) => {
    // First delete related records
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM variants WHERE product_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM products WHERE product_id = ?', [id]);
    return result;
  },

  // Variant operations
  createVariant: async (data) => {
    const {
      product_id, variant_name, sku, mrp_price, price,
      gst_percentage, gst_included, stock, weight, unit
    } = data;

    // Calculate GST amount and final price
    let gst_amount = 0;
    let final_price = price;

    if (gst_included) {
      gst_amount = (price * gst_percentage) / (100 + gst_percentage);
      final_price = price;
    } else {
      gst_amount = (price * gst_percentage) / 100;
      final_price = parseFloat(price) + parseFloat(gst_amount);
    }

    const [result] = await pool.query(
      `INSERT INTO variants (product_id, variant_name, sku, mrp_price, price, 
       gst_percentage, gst_included, gst_amount, final_price, stock, weight, unit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, variant_name, sku, mrp_price, price, gst_percentage,
       gst_included, gst_amount, final_price, stock, weight, unit]
    );
    return result;
  },

  updateVariant: async (id, data) => {
    const {
      variant_name, sku, mrp_price, price,
      gst_percentage, gst_included, stock, weight, unit
    } = data;

    let gst_amount = 0;
    let final_price = price;

    if (gst_included) {
      gst_amount = (price * gst_percentage) / (100 + gst_percentage);
      final_price = price;
    } else {
      gst_amount = (price * gst_percentage) / 100;
      final_price = parseFloat(price) + parseFloat(gst_amount);
    }

    const [result] = await pool.query(
      `UPDATE variants SET variant_name = ?, sku = ?, mrp_price = ?, price = ?,
       gst_percentage = ?, gst_included = ?, gst_amount = ?, final_price = ?,
       stock = ?, weight = ?, unit = ? WHERE variant_id = ?`,
      [variant_name, sku, mrp_price, price, gst_percentage, gst_included,
       gst_amount, final_price, stock, weight, unit, id]
    );
    return result;
  },

  updateStock: async (variantId, stock) => {
    const [result] = await pool.query(
      'UPDATE variants SET stock = ? WHERE variant_id = ?',
      [stock, variantId]
    );
    return result;
  },

  deleteVariant: async (id) => {
    const [result] = await pool.query('DELETE FROM variants WHERE variant_id = ?', [id]);
    return result;
  },

  // Image operations
 addProductImage: async (data) => {
  const { product_id, variant_id, image_url, is_main, is_video = 0 } = data;
  const [result] = await pool.query(
    `INSERT INTO product_images 
     (product_id, variant_id, image_url, is_main, is_video) 
     VALUES (?, ?, ?, ?, ?)`,
    [product_id, variant_id, image_url, is_main ? 1 : 0, is_video ? 1 : 0]
  );
  return result;
},

updateProductImage: async (imageId, data) => {
  const { image_url, is_main, is_video } = data;
  const [result] = await pool.query(
    `UPDATE product_images 
     SET image_url = ?, is_main = ?, is_video = ? 
     WHERE image_id = ?`,
    [image_url, is_main ? 1 : 0, is_video ? 1 : 0, imageId]
  );
  return result;
},

  deleteProductImage: async (id) => {
    const [result] = await pool.query('DELETE FROM product_images WHERE image_id = ?', [id]);
    return result;
  },


  getAllTags : async () => {
    const [result] = await pool.query("SELECT * FROM tags ORDER BY tag_name ASC");
    return result;
  }
};

module.exports = productModel;