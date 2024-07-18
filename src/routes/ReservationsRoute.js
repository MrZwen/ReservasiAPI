import express from "express"
import {
    getAllReservation,
    getReservationById
} from "../controllers/ReservationsController.js"

const router = express.Router();

router.get("/reservations", getAllReservation);
router.get("/reservations/:id", getReservationById);

export default router