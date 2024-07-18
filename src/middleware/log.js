import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fungsi untuk mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk mendapatkan nama file log berdasarkan tanggal
const getLogFilePath = (date) => {
    return path.join(__dirname, '../../logs', `logs-${date}.txt`);
};

// Variabel global untuk menyimpan tanggal log saat ini dan logFilePath
let currentLogDate = new Date().toISOString().split('T')[0];
let logFilePath = getLogFilePath(currentLogDate);

// Fungsi untuk memastikan direktori log ada
const ensureLogDirectoryExists = () => {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
};

// Fungsi untuk membackup log file
const backupLogFile = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const logFilePath = getLogFilePath(date);
    const backupDir = path.join(__dirname, '../../logs/backup');
    const backupFilePath = path.join(backupDir, `logs-${date}.txt`);

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    if (fs.existsSync(logFilePath)) {
        fs.rename(logFilePath, backupFilePath, (err) => {
            if (err) {
                console.error('Failed to backup log file:', err);
            } else {
                console.log(`Log file backed up as: ${backupFilePath}`);
            }
        });
    }
};

// Set interval untuk membackup log file setiap hari pada jam 24:00
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        backupLogFile();
        currentLogDate = now.toISOString().split('T')[0];
        logFilePath = getLogFilePath(currentLogDate);
    }
}, 60000); // Check every minute

export const logRequest = (req, res, next) => {
    const start = Date.now();
    const timeStamp = new Date().toLocaleString();
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

    if (ip.startsWith('::ffff:')) {
        ip = ip.split(':').pop();
    }

    const logMessage = `[${timeStamp}] User dengan IP: ${ip} melakukan request\r\n` +
                       `[${timeStamp}] Request ke Path: ${req.path}\n` +
                       `[${timeStamp}] Request type: ${req.method}`;

    console.log(logMessage);

    // Pastikan direktori log ada
    ensureLogDirectoryExists();

    // Cek dan perbarui nama file log jika tanggal telah berubah
    const now = new Date().toISOString().split('T')[0];
    if (now !== currentLogDate) {
        currentLogDate = now;
        logFilePath = getLogFilePath(currentLogDate);
    }

    // Write log message to the log file
    fs.appendFile(logFilePath, logMessage + '\n', (err) => {
        if (err) {
            console.error('Failed to write log to file:', err);
        }
    });

    next();

    res.on('finish', () => {
        const end = Date.now();
        const responseTime = end - start;
        const responseLogMessage = `[${timeStamp}] Response Time: ${responseTime}ms`;

        console.log(responseLogMessage);

        // Append response time to the log file
        fs.appendFile(logFilePath, responseLogMessage + '\r\n', (err) => {
            if (err) {
                console.error('Failed to write log to file:', err);
            }
        });
    });
};

export default logRequest;
