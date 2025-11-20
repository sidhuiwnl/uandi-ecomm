const pool = require('../config/database');


const collectionModel = {
    getAllCollections: async () => {
        const [rows] = await pool.query('SELECT * FROM collections');
        return rows;
    },

    addCollection: async (collection_name) => {
        const sql = `
            INSERT INTO collections (collection_name, is_active)
            VALUES (?, 1)
        `;

        const [result] = await pool.query(sql, [collection_name]);

        return result;
    },

    addProductsToCollection: async (collection_id, product_ids = []) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            if (!Array.isArray(product_ids) || product_ids.length === 0) {
                throw new Error("No products provided");
            }

            // Get current max sort_order for this collection
            const [existing] = await conn.query(
                "SELECT sort_order FROM collection_products WHERE collection_id = ? ORDER BY sort_order DESC LIMIT 1",
                [collection_id]
            );

            let startOrder = existing.length > 0 ? existing[0].sort_order + 1 : 1;

            const insertSQL = `
            INSERT INTO collection_products (collection_id, product_id, sort_order)
            VALUES (?, ?, ?)
        `;

            // Insert each product
            for (let i = 0; i < product_ids.length; i++) {
                await conn.query(insertSQL, [
                    collection_id,
                    product_ids[i],
                    startOrder + i,
                ]);
            }

            await conn.commit();

            return {
                success: true,
                message: "Products mapped to collection successfully",
                collection_id,
                product_ids
            };

        } catch (error) {
            await conn.rollback();
            console.error("Error mapping products:", error);
            throw error;
        } finally {
            conn.release();
        }
    },

    getCollectionWithProducts: async (collection_id) => {
        try {
            // 1️⃣ Get collection info
            const [collectionRows] = await pool.query(
                `SELECT * FROM collections WHERE collection_id = ?`,
                [collection_id]
            );

            if (collectionRows.length === 0) {
                throw new Error("Collection not found");
            }

            // 2️⃣ Get products with main_image and variants in one query
            const [products] = await pool.query(
                `SELECT
                     cp.product_id,
                     cp.sort_order,
                     p.product_name,
                     p.description,
                     p.is_active,
                     img.image_url AS main_image,
                     -- Variant data
                     v.variant_id,
                     v.variant_name,
                     v.price as variant_price,
                     v.final_price,
                     v.stock
                 FROM collection_products cp
                          INNER JOIN products p ON cp.product_id = p.product_id
                          LEFT JOIN product_images img ON img.product_id = p.product_id AND img.is_main = 1
                          LEFT JOIN variants v ON p.product_id = v.product_id  -- Removed v.is_active check
                 WHERE cp.collection_id = ? AND p.is_active = 1  -- Only check products.is_active
                 ORDER BY cp.sort_order ASC, p.product_id ASC, v.variant_id ASC`,
                [collection_id]
            );

            // 3️⃣ Group variants by product
            const groupedProducts = products.reduce((acc, row) => {
                const {
                    product_id,
                    product_name,
                    description,
                    main_image,
                    is_active,
                    sort_order,
                    // Variant fields
                    variant_id,
                    variant_name,
                    variant_price,
                    final_price,
                    stock
                } = row;

                // Find existing product
                let product = acc.find(p => p.product_id === product_id);

                if (!product) {
                    // Create new product entry
                    product = {
                        product_id,
                        product_name,
                        description,
                        main_image, // From product_images table
                        is_active,
                        sort_order,
                        variants: []
                    };
                    acc.push(product);
                }

                // Add variant if it exists
                if (variant_id) {
                    product.variants.push({
                        variant_id,
                        variant_name,
                        price: variant_price,
                        final_price,
                        stock
                    });
                }

                return acc;
            }, []);

            return {
                success: true,
                collection: collectionRows[0],
                products: groupedProducts
            };

        } catch (error) {
            console.error("Error fetching collection data:", error);
            throw error;
        }
    },

    updateCollectionOrders: async (collection_id, updateOrder) => {
        try {
            const ids = updateOrder.map(i => i.product_id);
            const caseStatements = updateOrder
                .map(item => `WHEN product_id = ${item.product_id} THEN ${item.sort_order}`)
                .join(" ");

            const sql = `
            UPDATE collection_products
            SET sort_order = CASE ${caseStatements} END
            WHERE collection_id = ?
            AND product_id IN (${ids.join(",")});
        `;

            await pool.query(sql, [collection_id]);

            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false };
        }
    }


};

module.exports = collectionModel;