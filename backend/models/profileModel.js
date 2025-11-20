const pool = require('../config/database');

const profileModel = {
  findById: async (user_id) => {
    const [rows] = await pool.query(
      `SELECT 
              user_id, 
              email, 
              phone_number, 
              first_name, 
              last_name,
              google_id, 
              DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth,
              profile_picture_url, 
              role_id,
              is_active, 
              created_at
       FROM users 
       WHERE user_id = ?`,
      [user_id]
    );
    return rows[0];
  },

   findByRefreshToken: async (token) => {
    const [rows] = await pool.query(`SELECT 
                                      u.user_id,
                                      u.google_id,
                                      u.email,
                                      u.phone_number,
                                      u.first_name, 
                                      u.last_name,
                                      DATE_FORMAT(u.date_of_birth, '%Y-%m-%d') AS date_of_birth,
                                      u.profile_picture_url,
                                      u.created_at,
                                      u.last_login_at,
                                      u.last_logout_at,
                                      r.role_name
                                      FROM users u
                                      LEFT JOIN roles r ON u.role_id = r.role_id 
                                      WHERE refresh_token = ?`, [token]);
    return rows[0];
  },


  updateUser: async (user_id, fields) => {
    const keys = Object.keys(fields);
    if (keys.length === 0) return module.exports.findById(user_id);
    const values = Object.values(fields);
    const setSQL = keys.map((k) => `${k} = ?`).join(", ");
    await pool.query(
      `UPDATE users SET ${setSQL}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [...values, user_id]
    );
    return module.exports.findById(user_id);
  },

  updatePhoto: async (user_id, url) => {
    await pool.query(
      `UPDATE users SET profile_picture_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [url, user_id]
    );
    return module.exports.findById(user_id);
  }
};

module.exports = profileModel;