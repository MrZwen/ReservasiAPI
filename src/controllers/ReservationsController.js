import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllReservation = async (req, res) => {
    try {
        const reservation = await prisma.reservations.findMany();
        res.status(200).json(reservation);
    } catch (error) {
        res.status(400).json("Error", error.message);
    }
}

export const getReservationById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const reservation = await prisma.reservations.findUnique({
            where: {
                id: id
            }
        });
        if (!reservation) {
            return res.status(404).json({ message: "Reservation with id: " + id + " not found" });
        } else {
            res.status(200).json(reservation);
        }
    } catch (error) {
        res.status(400).json("Error", error.message);
    }
}

// export const createReservation = async (req, res) => {
//     try {
//         const reservation = await prisma.reservations.create({
//             data: req.body
//         });
//         res.status(200).json(reservation);
//     } catch (error) {
//         res.status(400).json("Error", error.message);
//     }
// }