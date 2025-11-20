const pool = require('../config/database');

class AdminUser {

  static async getAllUsers(roleFilter = null) {
    let query = `
      SELECT 
        u.user_id, 
        u.first_name, 
        u.last_name, 
        u.email,
        u.phone_number,
        u.is_active, 
        u.created_at, 
        r.role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
    `;

    const params = [];

    if (roleFilter) {
      query += ` WHERE r.role_name = ?`;
      params.push(roleFilter);
    } else {
      query += ` WHERE r.role_name != 'Customer'`;
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }
  
    static async getAllExceptCustomers() {
    const [rows] = await pool.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.is_active, u.created_at, 
             r.role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE r.role_name != 'Customer'
    `);
    return rows;
  }

  static async updateUserRole(userId, roleId) {
    await pool.query(`UPDATE users SET role_id = ? WHERE user_id = ?`, [roleId, userId]);
  }
};

module.exports = AdminUser;