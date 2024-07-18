import express from "express"
import {
    getAllRoles,
    getRolesById
} from "../controllers/RolesController.js"

const router = express.Router();

router.get("/roles", getAllRoles);
router.get("/roles/:id", getRolesById);

export default router;