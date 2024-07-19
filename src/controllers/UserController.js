import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import fs from 'fs';
import multer from "multer";
import path from 'path';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();


const saltRounds = 10;;

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/profile-pics');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage: storage }).single('profile_photo');

export const updateProfile = async (req, res) => {
    const { id } = req.params;
    const { username, phone, first_name, last_name, address, bio } = req.body;

    try {
        // Ambil data pengguna yang ada
        const existingUser = await prisma.users.findUnique({
            where: { id: Number(id) }
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        // Upload foto profil
        upload(req, res, async function (err) {
            if (err) {
                console.error('Upload Error:', err); 
                return res.status(500).json({ message: 'Gagal mengupload file', error: err.message });
            }

            // Ambil path foto profil yang lama
            const oldProfilePhotoPath = existingUser.profile_photo ? path.join('src/uploads/profile-pics', existingUser.profile_photo) : null;

            // Ambil path foto profil yang baru jika diupload
            const newProfilePhoto = req.file ? req.file.filename : existingUser.profile_photo;

            // Hapus foto profil lama jika ada dan berbeda dengan yang baru
            if (oldProfilePhotoPath && newProfilePhoto !== existingUser.profile_photo) {
                fs.unlink(oldProfilePhotoPath, (err) => {
                    if (err) {
                        console.error('Error deleting old profile photo:', err);
                    }
                });
            }

            // Perbarui data pengguna
            const user = await prisma.users.update({
                where: { id: Number(id) },
                data: {
                    username: username || existingUser.username,
                    phone: phone || existingUser.phone,
                    first_name: first_name || existingUser.first_name,
                    last_name: last_name || existingUser.last_name,
                    address: address || existingUser.address,
                    bio: bio || existingUser.bio,
                    profile_photo: newProfilePhoto
                }
            });

            // Kirim URL atau path dari foto profil dalam response
            res.status(200).json({ 
                message: 'Profil berhasil diperbarui', 
                user: {
                    ...user,
                    profile_photo_url: `/uploads/profile-pics/${user.profile_photo}`
                }
            });
        });
    } catch (error) {
        console.error('Update Profile Error:', error); // Log error jika terjadi
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const registerUser = async (req, res) => {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password || !phone) {
        return res.status(400).json({ message: 'Semua kolom harus diisi' });
    }

    try {
        // Cek apakah username sudah ada
        const existingUserByUsername = await prisma.users.findFirst({
            where: { username }
        });

        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username sudah digunakan.' });
        }

        // Cek apakah email sudah ada
        const existingUserByEmail = await prisma.users.findFirst({
            where: { email }
        });

        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email sudah digunakan.' });
        }

        // Enkripsi password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Buat token verifikasi
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Buat pengguna baru
        const user = await prisma.users.create({
            data: {
                username,
                email,
                phone,
                password: hashedPassword,
                first_name: '', 
                last_name: '', 
                address: '',   
                bio: '',        
                profile_photo: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
                role_id: 2,
                verification_token: verificationToken,
                is_verified: false
            }
        });

        // Kirim email verifikasi
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Verifikasi Email Anda',
            html: `
            <p>Silakan verifikasi email Anda dengan mengklik tombol berikut:</p>
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" 
               style="
                   display: inline-block; 
                   padding: 10px 20px; 
                   font-size: 16px; 
                   font-weight: bold; 
                   color: #fff; 
                   background-color: #007bff; 
                   text-decoration: none; 
                   border-radius: 5px;
                   text-align: center;
               ">Verifikasi Email</a>
            <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
        `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.' });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token verifikasi tidak ditemukan.' });
    }

    try {
        const user = await prisma.users.findFirst({
            where: { verification_token: token }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token verifikasi tidak valid.' });
        }

        await prisma.users.update({
            where: { id: user.id },
            data: {
                is_verified: true,
                verification_token: null
            }
        });

        res.status(200).json({ message: 'Email berhasil diverifikasi.' });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Semua kolom harus diisi' });
    }

    try {
        // Check if email exists in the database
        const user = await prisma.users.findFirst({
            where: { email: email.toLowerCase() } // Ensure email format matches the database
        });

        if (!user) {
            return res.status(400).json({ message: 'Email salah.' });
        }

        // Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Password salah.' });
        }

        // Check if email is verified
        if (!user.is_verified) {
            return res.status(400).json({ message: 'Email belum diverifikasi. Silakan cek email Anda.' });
        }

        // Create JWT token with additional information
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email harus diisi' });
    }

    try {
        // Temukan pengguna berdasarkan email
        const user = await prisma.users.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(404).json({ message: 'Email tidak ditemukan.' });
        }

        // Buat token reset password
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Token berlaku selama 1 jam

        // Simpan token dan tanggal kedaluwarsa ke database
        await prisma.users.update({
            where: { id: user.id },
            data: {
                reset_password_token: resetToken,
                reset_password_expires: expires
            }
        });

        // Kirim email reset password
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reset Password Anda',
            text: `Silakan reset password Anda dengan mengklik tautan berikut: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Link reset password telah dikirim ke email Anda.' });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token dan password baru harus diisi' });
    }

    try {
        // Temukan pengguna berdasarkan token dan pastikan token belum kedaluwarsa
        const user = await prisma.users.findFirst({
            where: {
                reset_password_token: token,
                reset_password_expires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token reset password tidak valid atau telah kedaluwarsa.' });
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password pengguna dan kosongkan token serta tanggal kedaluwarsa
        await prisma.users.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null
            }
        });

        // Kirim konfirmasi email (opsional)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Anda Telah Direset',
            text: 'Password Anda telah berhasil direset. Jika Anda tidak meminta perubahan ini, mohon segera hubungi kami.'
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password berhasil direset.' });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // pastikan secure true di produksi
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logout successful' });
}