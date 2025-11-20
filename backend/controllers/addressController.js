// backend/controllers/addressController.js
const addressModel = require("../models/addressModel");

const addressController = {
    // 🟢 Get all active addresses for a specific user
    getAddressesByUser: async (req, res) => {
        try {
            const { user_id } = req.params;
            const addresses = await addressModel.getAddressesByUser(user_id);

            res.json({ success: true, data: addresses });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🟢 Get single active address by ID
    getAddressById: async (req, res) => {
        try {
            const { id } = req.params;
            const address = await addressModel.getAddressById(id);

            if (!address) {
                return res
                    .status(404)
                    .json({ success: false, message: "Address not found" });
            }

            res.json({ success: true, data: address });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🟢 Create new address
    createAddress: async (req, res) => {
        try {
            const {
                user_id,
                full_name,
                phone_number,
                address_line_1,
                address_line_2,
                city,
                state,
                postal_code,
                country,
                is_default,
            } = req.body;

            if (
                !user_id ||
                !full_name ||
                !phone_number ||
                !address_line_1 ||
                !city ||
                !state ||
                !postal_code ||
                !country
            ) {
                return res
                    .status(400)
                    .json({ success: false, message: "All required fields are mandatory" });
            }

            // If this address is set as default, handle the default address logic
            if (is_default) {
                await addressModel.setDefaultAddress(null, user_id); // This will unset all defaults first
            }

            const result = await addressModel.createAddress({
                user_id,
                full_name,
                phone_number,
                address_line_1,
                address_line_2,
                city,
                state,
                postal_code,
                country,
                is_default: is_default ? 1 : 0,
            });

            res.status(201).json({
                success: true,
                message: "Address created successfully",
                data: { address_id: result.insertId },
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🟢 Update address
    updateAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                full_name,
                phone_number,
                address_line_1,
                address_line_2,
                city,
                state,
                postal_code,
                country,
                is_default,
                user_id
            } = req.body;

            // Verify address ownership (optional security check)
            if (user_id) {
                const isOwner = await addressModel.verifyAddressOwnership(id, user_id);
                if (!isOwner) {
                    return res.status(403).json({
                        success: false,
                        message: "Not authorized to update this address"
                    });
                }
            }

            // If setting as default, update all addresses for this user
            if (is_default && user_id) {
                await addressModel.setDefaultAddress(id, user_id);
            } else {
                // Regular update without changing default status
                const result = await addressModel.updateAddress(id, {
                    full_name,
                    phone_number,
                    address_line_1,
                    address_line_2,
                    city,
                    state,
                    postal_code,
                    country,
                    is_default: is_default ? 1 : 0,
                });

                if (result.affectedRows === 0) {
                    return res
                        .status(404)
                        .json({ success: false, message: "Address not found or already deleted" });
                }
            }

            res.json({ success: true, message: "Address updated successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🟢 Soft delete address
    deleteAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const { user_id } = req.body; // Optional: for ownership verification

            // Verify address ownership if user_id is provided
            if (user_id) {
                const isOwner = await addressModel.verifyAddressOwnership(id, user_id);
                if (!isOwner) {
                    return res.status(403).json({
                        success: false,
                        message: "Not authorized to delete this address"
                    });
                }
            }

            const result = await addressModel.softDeleteAddress(id);

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ success: false, message: "Address not found or already deleted" });
            }

            res.json({ success: true, message: "Address deleted successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🟢 Set default address
    setDefaultAddress: async (req, res) => {
        try {
            const { address_id, user_id } = req.body;

            if (!address_id || !user_id) {
                return res
                    .status(400)
                    .json({ success: false, message: "Address ID and User ID are required" });
            }

            // Verify address ownership
            const isOwner = await addressModel.verifyAddressOwnership(address_id, user_id);
            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to modify this address"
                });
            }

            const result = await addressModel.setDefaultAddress(address_id, user_id);

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ success: false, message: "Address not found or already deleted" });
            }

            res.json({ success: true, message: "Default address updated successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🟢 Get default address for user
    getDefaultAddress: async (req, res) => {
        try {
            const { user_id } = req.params;
            const address = await addressModel.getDefaultAddress(user_id);

            if (!address) {
                return res
                    .status(404)
                    .json({ success: false, message: "No default address found" });
            }

            res.json({ success: true, data: address });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🟢 Restore soft-deleted address (admin/utility function)
    restoreAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await addressModel.restoreAddress(id);

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ success: false, message: "Address not found" });
            }

            res.json({ success: true, message: "Address restored successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = addressController;