import express from "express"
import {
    getAllHistory,
    getHistoryById
} from "../controllers/HistoryController.js"

const router = express.Router()

router.get("/history", getAllHistory)
router.get("/history/:id", getHistoryById)

export default router