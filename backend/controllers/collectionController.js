const  collectionModel = require("../models/collectionModel");


const collectionController = {

    getAllCollections: async (req, res) => {
        try {
            const collections = await collectionModel.getAllCollections();
            res.json(collections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    addCollection: async (req, res) => {
        try {
            const { collection_name } = req.body;
            const result = await collectionModel.addCollection(collection_name);
            res.status(201).json({
                success: true,
                message: 'Collection created successfully',
                data: { collection_id : result.insertId }
            });
        } catch (error)  {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Collection name already exists'
                });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    mapProductsToCollection: async (req, res) => {
        try {
            const { collection_id, product_ids } = req.body;

            const result = await collectionModel.addProductsToCollection(
                collection_id,
                product_ids
            );

            res.status(201).json({
                success: true,
                message: "Products mapped successfully",
                data: result
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getCollectionWithProducts: async (req, res) => {
        try {
            const { id } = req.params;

            const result = await collectionModel.getCollectionWithProducts(id);

            res.status(200).json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    updateCollectionOrder: async (req, res) => {
        const collection_id = req.params.collection_id;
        const { updatedOrder } = req.body; // array of { product_id, sort_order }

        if (!updatedOrder || !Array.isArray(updatedOrder)) {
            return res.status(400).json({
                success: false,
                message: "updatedOrder array is required"
            });
        }

        try {
            await collectionModel.updateCollectionOrders(collection_id,updatedOrder);

            return res.json({
                success: true,
                message: "Collection sort order updated successfully"
            });
        }catch(error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = collectionController;