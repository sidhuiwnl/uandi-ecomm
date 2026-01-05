const RoutineModel = require('../models/userRoutineModel');

const routineController = {

    /**
     * CREATE ROUTINE
     */
    createRoutine: async (req, res) => {
        try {
            console.log('[routineController] ▶ Create routine request');

            const { user_id, routine_name, slot_count, items } = req.body;

            console.log('[routineController] user_id:', user_id);
            console.log('[routineController] routine_name:', routine_name);
            console.log('[routineController] items length:', Array.isArray(items) ? items.length : 0);

            /* ---------- BASIC VALIDATION ---------- */
            if (!user_id || !routine_name || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid routine data'
                });
            }


            /* ---------- CREATE ROUTINE ---------- */
            const routineId = await RoutineModel.createRoutine(
                user_id,
                routine_name,
                slot_count,
                items
            );

            console.log('[routineController] ✅ Routine created:', routineId);

            return res.status(201).json({
                success: true,
                routine_id: routineId
            });

        } catch (error) {
            console.error('[routineController] ❌ Create routine error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create routine'
            });
        }
    },

    /**
     * GET ALL ROUTINES FOR USER
     * (BODY-BASED USER ID, CONSISTENT WITH CART)
     */
    getUserRoutines: async (req, res) => {
        try {
            const { user_id } = req.query;

            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const routines = await RoutineModel.getUserRoutines(user_id);

            res.status(200).json({
                success: true,
                routines
            });

        } catch (error) {
            console.error('[routineController] ❌ Get routines error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch routines'
            });
        }
    },

    /**
     * GET SINGLE ROUTINE
     */
    getRoutineById: async (req, res) => {
        try {
            const { routine_id } = req.params;
            const { user_id } = req.query;

            const routine = await RoutineModel.getRoutineById(routine_id, user_id);

            if (!routine) {
                return res.status(404).json({
                    success: false,
                    message: 'Routine not found'
                });
            }

            res.status(200).json({
                success: true,
                routine
            });

        } catch (error) {
            console.error('[routineController] ❌ Get routine error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch routine'
            });
        }
    },

    /**
     * DELETE ROUTINE (SOFT DELETE)
     */
    deleteRoutine: async (req, res) => {
        try {
            const { routine_id } = req.params;
            const { user_id } = req.body;

            await RoutineModel.deleteRoutine(routine_id, user_id);

            res.status(200).json({
                success: true,
                message: 'Routine deleted successfully'
            });

        } catch (error) {
            console.error('[routineController] ❌ Delete routine error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete routine'
            });
        }
    }

};

module.exports = routineController;
