import express from "express"
import {
    getAllRooms,
    getRoomsById
} from "../controllers/RoomsController.js"

const router = express.Router()

router.get("/rooms", getAllRooms)
router.get("rooms/:id", getRoomsById)

export default router