import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Replace with actual external logging service
const logToExternalService = (logMessage) => {
  // Example of sending logs to an external service
  // e.g., using axios or fetch to send logs
  // axios.post('https://external-logging-service.com/logs', { message: logMessage });
};

const logRequest = (req, res, next) => {
    const start = Date.now();
    const timeStamp = new Date().toLocaleString();
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

    if (ip.startsWith('::ffff:')) {
        ip = ip.split(':').pop();
    }

    const logMessage = `[${timeStamp}] User dengan IP: ${ip} melakukan request\n` +
                       `[${timeStamp}] Request ke Path: ${req.path}\n` +
                       `[${timeStamp}] Request type: ${req.method}`;

    // Log to the console
    console.log(logMessage);

    // Optionally, send logs to an external service
    logToExternalService(logMessage);

    next();

    res.on('finish', () => {
        const end = Date.now();
        const responseTime = end - start;
        const responseLogMessage = `[${timeStamp}] Response Time: ${responseTime}ms`;

        // Log response time to the console
        console.log(responseLogMessage);

        // Optionally, send response time logs to an external service
        logToExternalService(responseLogMessage);
    });
};

export default logRequest;
