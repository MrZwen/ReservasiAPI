import express from "express"
import { verifyToken } from "../middleware/auth.js";
import {
    getAllUsers,
    getUsersById,
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    requestPasswordReset,
    resetPassword,
    updateProfile
} from "../controllers/UserController.js"

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/:id", getUsersById);
router.post("/users", registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/update-profile/:id', verifyToken,updateProfile);


export default router;