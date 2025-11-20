const pool = require('../config/database');
const slugify = require('slugify');

class Blog {
  static async generateSlug(title) {
    const base = slugify(title, { lower: true, strict: true });
    const [rows] = await pool.query('SELECT slug FROM blogs WHERE slug LIKE ?', [`${base}%`]);
    const count = rows.length;
    return count === 0 ? base : `${base}-${count + 1}`;
  }

  static async create(data) {
    const { title, content, excerpt, featured_image, author_id } = data;
    const slug = await this.generateSlug(title);
    const [result] = await pool.execute(
      `INSERT INTO blogs (title, slug, content, excerpt, featured_image, author_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
      [title, slug, content, excerpt || null, featured_image || null, author_id || null]
    );
    return { id: result.insertId, slug, ...data };
  }

  static async update(id, data) {
    const updates = [];
    const values = [];

    if (data.title) {
      updates.push('title = ?');
      values.push(data.title);
      const slug = await this.generateSlug(data.title);
      updates.push('slug = ?');
      values.push(slug);
      data.slug = slug;
    }
    if (data.content !== undefined) { updates.push('content = ?'); values.push(data.content); }
    if (data.excerpt !== undefined) { updates.push('excerpt = ?'); values.push(data.excerpt); }
    if (data.featured_image !== undefined) { updates.push('featured_image = ?'); values.push(data.featured_image); }
    if (data.status) { updates.push('status = ?'); values.push(data.status); }

    if (updates.length === 0) return null;

    values.push(id);
    const query = `UPDATE blogs SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await pool.execute(query, values);
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
    return true;
  }

  static async findAll({ status } = {}) {
    let query = 'SELECT * FROM blogs';
    const params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM blogs WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM blogs WHERE slug = ? AND status = "published"', [slug]);
    return rows[0] || null;
  }

  static async toggleHide(id, hide = true) {
    const status = hide ? 'hidden' : 'published';
    await pool.execute('UPDATE blogs SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }
}

module.exports = Blog;