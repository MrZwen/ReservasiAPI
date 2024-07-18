import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getAllRoles = async (req, res) => {
    try{
        const roles = await prisma.roles.findMany();
        res.status(200).json(roles);
    } catch (error) {   
        res.status(400).json("Error", error.message);
    }
}

export const getRolesById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const roles = await prisma.roles.findUnique({
            where: {
                id: id
            }
        });
        if (!roles) {
            return res.status(404).json({ message: "Role dengan id: " + id + " tidak ditemukan" });
        } else {
            res.status(200).json(roles);
        }
    } catch (error) {
        res.status(400).json({ message: "Error", error: error.message });
    }
}