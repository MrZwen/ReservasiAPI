import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllHistory = async (req, res) => {
    try {
        const history = await prisma.reservationHistory.findMany();
        res.status(200).json(history);
    } catch (error) {
        res.status(400).json({ message: "Error", error: error.message });
    }
}

export const getHistoryById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const history = await prisma.reservationHistory.findUnique({
            where: {
                id: id
            }
        });
        if (!history) {
            return res.status(404).json({ message: "History dengan id: " + id + " tidak ditemukan" });
        } else {
            res.status(200).json(history);
        }
    } catch (error) {
        res.status(400).json({ message: "Error", error: error.message });
    }
}