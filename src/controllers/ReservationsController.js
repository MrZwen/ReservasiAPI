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
            return res.status(404).json({ message: "Reservasi dengan id: " + id + " tidak ditemukan" });
        } else {
            res.status(200).json(reservation);
        }
    } catch (error) {
        res.status(400).json("Error", error.message);
    }
}

export const createReservation = async (req, res) => {
    const { user_id, room_id, check_in_date, check_out_date, status } = req.body;

    // Validasi input
    if (!user_id || !room_id || !check_in_date || !check_out_date) {
        return res.status(400).json({ error: 'Semua kolom harus diisi' });
    }

    try {
        // Periksa status kamar
        const room = await prisma.rooms.findUnique({
            where: { id: room_id }
        });

        if (!room) {
            return res.status(404).json({ error: 'Kamar tidak ditemukan.' });
        }

        if (room.status !== 'available') {
            return res.status(400).json({ error: 'Kamar tidak tersedia.' });
        }

        // Buat reservasi
        const reservation = await prisma.reservations.create({
            data: {
                user_id,
                room_id,
                check_in_date: new Date(check_in_date),
                check_out_date: new Date(check_out_date),
                status: status || 'booked' 
            }
        });

        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateReservation = async (req, res) => {
    const { id } = req.params;
    const { user_id, room_id, check_in_date, check_out_date, status } = req.body;

    if (!id || (!user_id && !room_id && !check_in_date && !check_out_date && !status)) {
        return res.status(400).json({ error: 'Semua kolom harus diisi' });
    }

    try {
        const updatedReservation = await prisma.reservations.update({
            where: { id: parseInt(id) },
            data: {
                user_id: user_id || undefined,
                room_id: room_id || undefined,
                check_in_date: check_in_date ? new Date(check_in_date) : undefined,
                check_out_date: check_out_date ? new Date(check_out_date) : undefined,
                status: status || undefined
            }
        });

        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteReservation = async (req, res) => {
    const { id } = req.params;

    try {
        // Cari reservasi yang akan dihapus
        const reservation = await prisma.reservations.findUnique({
            where: { id: parseInt(id) }
        });

        if (!reservation) {
            return res.status(404).json({ error: 'Reservasi tidak ditemukan' });
        }

        // Hapus reservasi
        await prisma.reservations.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({ message: 'Reservasi berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};