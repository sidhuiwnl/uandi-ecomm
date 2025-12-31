const express = require( "express" );
const { createRoutine,deleteRoutine,getUserRoutines,getRoutineById } = require('../controllers/userRoutineController')

const router = express.Router();

// 🔐 All routes are protected
router.post("/", createRoutine);
router.get("/", getUserRoutines);
router.get("/:routine_id", getRoutineById);
router.delete("/:routine_id", deleteRoutine);

module.exports = router;
