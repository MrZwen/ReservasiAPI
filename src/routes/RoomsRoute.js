import express from "express"
import {
    getAllRooms,
    getRoomsById,
    createRooms,
    updateRooms,
    deleteRooms
} from "../controllers/RoomsController.js"

const router = express.Router()

router.get("/rooms", getAllRooms)
router.get("/rooms/:id", getRoomsById)
router.post("/rooms", createRooms)
router.patch("/rooms/:id", updateRooms)
router.delete("/rooms/:id", deleteRooms)

export default router