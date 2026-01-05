const pool = require('../config/database');
const crypto = require('crypto');





const buildSignature = (items) => {
    return items
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(i => `${i.product_id}-${i.variant_id}-${i.position}`)
        .join('|');
};

class RoutineModel {

    static generateRoutineSignature(items) {
        return crypto
            .createHash('sha256')
            .update(
                items
                    .sort((a, b) => a.position - b.position)
                    .map(i => `${i.product_id}:${i.variant_id ?? 'null'}:${i.position}`)
                    .join('|')
            )
            .digest('hex');
    }

    /* -------------------------------
       DUPLICATE CHECK
    -------------------------------- */
    static async isDuplicateRoutine(user_id, routine_name, slot_count, items) {
        const signature = buildSignature(items);

        const [rows] = await pool.query(
            `
      SELECT r.routine_id
      FROM user_routines r
      JOIN user_routine_items ri 
        ON r.routine_id = ri.routine_id
      WHERE r.user_id = ?
        AND LOWER(r.routine_name) = LOWER(?)
        AND r.slot_count = ?
        AND r.is_active = 1
      GROUP BY r.routine_id
      HAVING GROUP_CONCAT(
        CONCAT(ri.product_id, '-', ri.variant_id, '-', ri.position)
        ORDER BY ri.position
      ) = ?
      `,
            [user_id, routine_name, slot_count, signature]
        );

        return rows.length > 0;
    }

    /* -------------------------------
       CREATE ROUTINE (TX)
    -------------------------------- */
    static async createRoutine(user_id, routine_name, slot_count, items) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // ✅ 1️⃣ Generate deterministic signature
            const routine_signature = this.generateRoutineSignature(items);

            // ✅ 2️⃣ Insert routine (DB enforces uniqueness)
            const [routineResult] = await connection.query(
                `
            INSERT INTO user_routines
                (user_id, routine_name, slot_count, routine_signature, is_active)
            VALUES (?, ?, ?, ?, 1)
            `,
                [user_id, routine_name, slot_count, routine_signature]
            );

            const routine_id = routineResult.insertId;

            // ✅ 3️⃣ Insert items
            const itemValues = items.map(item => [
                routine_id,
                item.product_id,
                item.variant_id ?? null,
                item.position
            ]);

            await connection.query(
                `
                    INSERT INTO user_routine_items
                        (routine_id, product_id, variant_id, position)
                    VALUES ?
                `,
                [itemValues]
            );

            await connection.commit();
            return routine_id;

        } catch (error) {
            await connection.rollback();
            throw error; // controller handles ER_DUP_ENTRY
        } finally {
            connection.release();
        }
    }
    /* -------------------------------
       GET USER ROUTINES
    -------------------------------- */
    static async getUserRoutines(user_id) {
        const [rows] = await pool.query(
            `
                SELECT routine_id, routine_name, slot_count, created_at
                FROM user_routines
                WHERE user_id = ? AND is_active = 1
                ORDER BY created_at DESC
            `,
            [user_id]
        );
        return rows;
    }

    /* -------------------------------
       GET ROUTINE WITH ITEMS
    -------------------------------- */
    static async getRoutineById(routine_id, user_id) {
        const [[routine]] = await pool.query(
            `
                SELECT *
                FROM user_routines
                WHERE routine_id = ?
                  AND user_id = ?
                  AND is_active = 1
            `,
            [routine_id, user_id]
        );

        if (!routine) return null;

        const [items] = await pool.query(
            `
                SELECT product_id, variant_id, position
                FROM user_routine_items
                WHERE routine_id = ?
                ORDER BY position ASC
            `,
            [routine_id]
        );

        return { ...routine, items };
    }

    /* -------------------------------
       SOFT DELETE
    -------------------------------- */
    static async deleteRoutine(routine_id, user_id) {
        await pool.query(
            `
                UPDATE user_routines
                SET is_active = 0
                WHERE routine_id = ? AND user_id = ?
            `,
            [routine_id, user_id]
        );
    }
}

module.exports = RoutineModel;
