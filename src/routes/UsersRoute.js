import express from "express"
import {
    getAllUsers,
    getUsersById
} from "../controllers/UserController.js"

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/:id", getUsersById);

export default router;