const pool = require('../config/database');

class Video {
  static async create({ product_id, reel_url, title, duration_seconds }) {
    const [result] = await pool.execute(
      `INSERT INTO shoppable_videos (product_id, reel_url, title, duration_seconds)
       VALUES (?, ?, ?, ?)`,
      [product_id, reel_url, title || null, duration_seconds || null]
    );
    return { video_id: result.insertId };
  }

  static async findByProductId(product_id) {
    const [rows] = await pool.execute(
      `SELECT video_id, reel_url, title, duration_seconds, is_active, created_at
       FROM shoppable_videos
       WHERE product_id = ? AND is_active = TRUE
       ORDER BY created_at DESC`,
      [product_id]
    );
    return rows;
  }

  static async findAllWithProduct() {
    const [rows] = await pool.execute(
      `SELECT v.video_id, v.reel_url, v.title, v.duration_seconds, v.created_at, p.product_id, p.product_name
       FROM shoppable_videos v
       JOIN products p ON v.product_id = p.product_id
       WHERE v.is_active = TRUE
       ORDER BY v.created_at DESC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM shoppable_videos WHERE video_id = ? LIMIT 1`, [id]
    );
    return rows[0];
  }

  static async update(id, { title }) {
    await pool.execute(
      `UPDATE shoppable_videos SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE video_id = ? AND is_active = TRUE`,
      [title || null, id]
    );
  }

  static async softDelete(id) {
    await pool.execute(`UPDATE shoppable_videos SET is_active = FALSE WHERE video_id = ?`, [id]);
  }

  static async hardDelete(id) {
    await pool.execute(`DELETE FROM shoppable_videos WHERE video_id = ?`, [id]);
  }
}

module.exports = Video;