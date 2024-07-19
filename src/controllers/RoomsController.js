import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await prisma.rooms.findMany()
        res.status(200).json(rooms)
    } catch (error){
        res.status(500).json({ msg: error.message })
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
        res.status(500).json({ msg: error.message })
    }
}

export const createRooms = async (req, res) => {
    try {
        const { room_number, room_type, price, status, description } = req.body;

        // Validasi input tidak boleh kosong
        if (!room_number || !room_type || !price || !status || !description) {
            return res.status(400).json({ message: "Data tidak boleh ada yang kosong" });
        }

        // Cek apakah room dengan room_number yang sama sudah ada
        const existingRoom = await prisma.rooms.findUnique({
            where: { room_number: room_number }
        });

        if (existingRoom) {
            return res.status(400).json({ message: "Room dengan nomor tersebut sudah ada" });
        }

        // Buat room baru
        const room = await prisma.rooms.create({
            data: {
                room_number: room_number,
                room_type: room_type,
                price: price,
                status: status,
                description: description
            }
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const updateRooms = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { room_number, room_type, price, status, description } = req.body
        if (!room_number || !room_type || !price || !status || !description) {
            return res.status(400).json({ message: "Data tidak boleh ada yang kosong" })
        }
        const room = await prisma.rooms.update({
            where: {
                id: id
            },
            data: {
                room_number: room_number,
                room_type: room_type,
                price: price,
                status: status,
                description: description
            }
        })
        res.status(201).json(room)
    } catch(error){
        res.status(500).json({msg: error.message})
    }
}

export const deleteRooms = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ message: "ID yang diberikan tidak valid" });
        }

        const room = await prisma.rooms.findUnique({
            where: { id: id }
        });

        if (!room) {
            return res.status(404).json({ message: "Rooms dengan id: " + id + " tidak ditemukan" });
        }

        const response = await prisma.rooms.delete({
            where: { id: id },
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}