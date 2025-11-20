
const pool = require("../config/database");

const addressModel = {
    // Create new address
    async createAddress(data) {
        const query = `
            INSERT INTO addresses 
            (user_id, full_name, phone_number, address_line_1, address_line_2, city, state, postal_code, country, is_default, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
        `;

        const [result] = await pool.query(query, [
            data.user_id,
            data.full_name,
            data.phone_number,
            data.address_line_1,
            data.address_line_2 || "",
            data.city,
            data.state,
            data.postal_code,
            data.country,
            data.is_default ? 1 : 0,
        ]);

        return result;
    },

    // Get all active addresses for a user
    async getAddressesByUser(user_id) {
        const [rows] = await pool.query(
            "SELECT * FROM addresses WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC",
            [user_id]
        );
        return rows;
    },

    // Get a single active address by ID
    async getAddressById(address_id) {
        const [rows] = await pool.query(
            "SELECT * FROM addresses WHERE address_id = ? AND is_active = TRUE",
            [address_id]
        );
        return rows[0];
    },

    // Update address (only active ones)
    async updateAddress(address_id, data) {
        const query = `
            UPDATE addresses 
            SET full_name=?, phone_number=?, address_line_1=?, address_line_2=?, city=?, state=?, postal_code=?, country=?, is_default=?, updated_at=NOW()
            WHERE address_id=? AND is_active = TRUE
        `;

        const [result] = await pool.query(query, [
            data.full_name,
            data.phone_number,
            data.address_line_1,
            data.address_line_2 || "",
            data.city,
            data.state,
            data.postal_code,
            data.country,
            data.is_default ? 1 : 0,
            address_id,
        ]);

        return result;
    },

    // Soft delete address
    async softDeleteAddress(address_id) {
        const [result] = await pool.query(
            'UPDATE addresses SET is_active = FALSE, updated_at = NOW() WHERE address_id = ? AND is_active = TRUE',
            [address_id]
        );
        return result;
    },

    // Set default address (and unset others for the same user)
    async setDefaultAddress(address_id, user_id) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // First, unset all default addresses for this user
            await connection.query(
                'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND is_active = TRUE',
                [user_id]
            );

            // Then set the specified address as default
            const [result] = await connection.query(
                'UPDATE addresses SET is_default = TRUE WHERE address_id = ? AND user_id = ? AND is_active = TRUE',
                [address_id, user_id]
            );

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Get default address for a user
    async getDefaultAddress(user_id) {
        const [rows] = await pool.query(
            'SELECT * FROM addresses WHERE user_id = ? AND is_default = TRUE AND is_active = TRUE LIMIT 1',
            [user_id]
        );
        return rows[0];
    },

    // Check if address belongs to user (for authorization)
    async verifyAddressOwnership(address_id, user_id) {
        const [rows] = await pool.query(
            'SELECT address_id FROM addresses WHERE address_id = ? AND user_id = ? AND is_active = TRUE',
            [address_id, user_id]
        );
        return rows.length > 0;
    },

    // Get all addresses including inactive (for admin purposes)
    async getAllAddressesByUser(user_id) {
        const [rows] = await pool.query(
            "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_active DESC, created_at DESC",
            [user_id]
        );
        return rows;
    },

    // Restore a soft-deleted address (if needed)
    async restoreAddress(address_id) {
        const [result] = await pool.query(
            'UPDATE addresses SET is_active = TRUE, updated_at = NOW() WHERE address_id = ?',
            [address_id]
        );
        return result;
    }
};

module.exports = addressModel;