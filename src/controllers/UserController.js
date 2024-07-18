import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json("Error", error.message);
    }
}

export const getUsersById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const users = await prisma.users.findUnique({
            where: {
                id: id
            }
        });
        if (!users) {
            return res.status(404).json({ message: "User dengan id: " + id + " tidak ditemukan" });
        } else {
            res.status(200).json(users);
        }
    } catch (error) {
        res.status(400).json({ message: "Error", error: error.message });
    }
}