import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await prisma.rooms.findMany()
        res.status(200).json(rooms)
    } catch (error){
        res.status(400).json("Error", error.message)
    }
}

export const getRoomsById = async (req, res) => {
    try { 
        const id = parseInt(req.params.id)
        const rooms = await prisma.rooms.findUnique({
            where: {
                id: id
            }
        })
        if (!rooms) {
            return res.status(404).json({ message: "Room dengan id: " + id + " tidak ditemukan" })
        } else {
            res.status(200).json(rooms)
        }
    } catch (error){
        res.status(400).json("Error", error.message)
    }
}

export const createRoom = async (req, res) => {
    try {
        const { room_number, room_type, price, status, description } = req.body
        const room = await prisma.rooms.create({
            data: {
                room_number: room_number,
                room_type: room_type,
                price: price,
                status: status,
                description: description
            }
        })
        if (room_number === null || room_type === null || price === null || status === null || description === null) {
            return res.status(400).json({ message: "Data tidak boleh ada yang kosong" })
        } else {
            res.status(200).json(room)
        }
    } catch (error) {
        res.status(400).json("Error", error.message)
    }
}