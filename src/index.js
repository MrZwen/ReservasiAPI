import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import logRequest from "./middleware/log.js";
import RolesRoute from "./routes/RolesRoute.js";
import UserRoute from "./routes/UsersRoute.js";
import RoomsRoute from "./routes/RoomsRoute.js"
import HistoryRoute from "./routes/HistoryRoute.js"
import ReservationRoute from "./routes/ReservationsRoute.js"

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use(logRequest)
app.use(RolesRoute, UserRoute, RoomsRoute, HistoryRoute, ReservationRoute);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
})
