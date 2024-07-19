import express from "express"
import {
    getAllReservation,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation
} from "../controllers/ReservationsController.js"

const router = express.Router();

router.get("/reservations", getAllReservation);
router.get("/reservations/:id", getReservationById);
router.post("/reservations", createReservation);
router.patch("/reservations/:id", updateReservation);
router.delete("/reservations/:id", deleteReservation);

export default router