const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT 
       u.*, 
       r.role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }
  
  static async findByGoogleIdOrIdentifier(identifier) {
  const [rows] = await pool.query(
    `SELECT 
       u.*, 
       r.role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     WHERE u.google_id = ? OR u.email = ? OR u.phone_number = ?`,
    [identifier, identifier, identifier]
  );
  return rows[0];
}

  static async findByResetToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    return rows[0];
  }

  static async findByRefreshToken(token) {
    const [rows] = await pool.query(`SELECT 
                                      u.*, 
                                      r.role_name
                                      FROM users u
                                      LEFT JOIN roles r ON u.role_id = r.role_id 
                                      WHERE refresh_token = ?`, [token]);
    return rows[0];
  }

  static async createGoogleUser(googleId, email, firstName, lastName, profilePictureUrl) {
  const [result] = await pool.query(
    `INSERT INTO users (
        google_id, 
        email, 
        first_name, 
        last_name, 
        profile_picture_url,
        last_login_at,
        role_id
     ) 
     VALUES (
        ?, ?, ?, ?, ?, NOW(),
        (SELECT role_id FROM roles WHERE role_name = "customer")
     )`,
    [googleId, email, firstName, lastName, profilePictureUrl]
  );

  // return complete user object
  return this.findByGoogleIdOrIdentifier(googleId);
}


  static async createManualUser(email, phoneNumber, password, firstName, lastName) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, phone_number, password_hash, first_name, last_name, role_id) VALUES (?, ?, ?, ?, ?, (SELECT role_id FROM roles WHERE role_name = "customer"))',
      [email || null, phoneNumber || null, passwordHash, firstName, lastName]
    );
    return this.findByGoogleIdOrIdentifier(email || phoneNumber);
  }

  static async updateResetToken(userId, token, expiry) {
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE user_id = ?',
      [token, expiry, userId]
    );
  }

  static async updatePassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?',
      [passwordHash, userId]
    );
  }

  static async updateRefreshToken(userId, refreshToken) {
    await pool.query('UPDATE users SET refresh_token = ? WHERE user_id = ?', [refreshToken, userId]);
  }

  static async updateLastLogin(userId) {
  return pool.query(
    "UPDATE users SET last_login_at = NOW() WHERE user_id = ?",
    [userId]
  );
}

static async updateLastLogout(userId) {
  return pool.query(
    "UPDATE users SET last_logout_at = NOW() WHERE user_id = ?",
    [userId]
  );
}

static async createSession(userId, refreshToken) {
    await pool.query('UPDATE users SET refresh_token = ?, last_login_at = NOW() WHERE user_id = ?', [refreshToken, userId]);
  }



static async clearSession(userId) {
  await pool.query(
    `UPDATE users 
     SET refresh_token = NULL, 
         last_logout_at = NOW()
     WHERE user_id = ?`,
    [userId]
  );
}

}

module.exports = User;