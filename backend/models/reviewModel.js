const pool = require('../config/database');

const ReviewModel = {
  async create(review) {
    const conn = await pool.getConnection();
    try {
      const [res] = await conn.query(
        `INSERT INTO reviews (product_id, user_id, ratings, review_title, review_description, images_json, verified)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [review.product_id, review.user_id, review.ratings, review.review_title || null, review.review_description || null, JSON.stringify(review.images || []), review.verified ? 1 : 0]
      );
      return { review_id: res.insertId };
    } finally {
      conn.release();
    }
  },

  async findByProduct(product_id, { rating, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let sql = `SELECT * FROM reviews WHERE product_id = ?`;
    const params = [product_id];
    if (rating) {
      sql += ` AND ratings = ?`;
      params.push(rating);
    }
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(review_id) {
    const [rows] = await pool.query(`SELECT * FROM reviews WHERE review_id = ?`, [review_id]);
    return rows[0];
  },

  async update(review_id, patch) {
    // build dynamic set
    const fields = [];
    const params = [];
    if (patch.ratings !== undefined) { fields.push('ratings = ?'); params.push(patch.ratings); }
    if (patch.review_title !== undefined) { fields.push('review_title = ?'); params.push(patch.review_title); }
    if (patch.review_description !== undefined) { fields.push('review_description = ?'); params.push(patch.review_description); }
    if (patch.images !== undefined) { fields.push('images_json = ?'); params.push(JSON.stringify(patch.images)); }
    if (patch.verified !== undefined) { fields.push('verified = ?'); params.push(patch.verified ? 1 : 0); }

    if (fields.length === 0) return null;
    params.push(review_id);
    const sql = `UPDATE reviews SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?`;
    const [res] = await pool.query(sql, params);
    return res;
  },

  async delete(review_id) {
    const [res] = await pool.query(`DELETE FROM reviews WHERE review_id = ?`, [review_id]);
    return res.affectedRows;
  },

async listAll({ rating, product_id, sort = "latest", page = 1, limit = 10, from_date, to_date }) {
  const offset = (page - 1) * limit;
  const params = [];

  let sql = `
    SELECT 
      r.*,
      p.product_name,
      CONCAT(u.first_name, ' ', u.last_name) AS user_full_name
    FROM reviews r
    JOIN products p ON r.product_id = p.product_id
    JOIN users u ON r.user_id = u.user_id
    WHERE 1=1
  `;

  if (rating) {
    sql += ` AND r.ratings = ?`;
    params.push(rating);
  }

  if (product_id) {
    sql += ` AND r.product_id = ?`;
    params.push(product_id);
  }

  /** 🔥 Date range filter */
  if (from_date) {
    sql += ` AND DATE(r.created_at) >= ?`;
    params.push(from_date);
  }

  if (to_date) {
    sql += ` AND DATE(r.created_at) <= ?`;
    params.push(to_date);
  }

  // Sort
  sql += sort === "oldest"
    ? ` ORDER BY r.created_at ASC`
    : ` ORDER BY r.created_at DESC`;

  sql += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(sql, params);
  return rows;
}



};

module.exports = ReviewModel;
