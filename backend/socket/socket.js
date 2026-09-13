import {Server} from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (process.env.FRONTEND_URL) {
                const allowed = process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''));
                if (allowed.includes(origin) || allowed.includes('*')) {
                    return callback(null, true);
                }
            }
            if (origin.startsWith('http://localhost') || origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        methods: ['GET', 'POST'],
        credentials: true
    },
});

const parseCookies = (cookieHeader) => {
    if (!cookieHeader) return {};
    return cookieHeader.split(';').reduce((cookies, item) => {
        const [name, ...valParts] = item.trim().split('=');
        if (name) {
            const rawVal = valParts.join('=');
            try {
                cookies[name] = decodeURIComponent(rawVal);
            } catch {
                cookies[name] = rawVal;
            }
        }
        return cookies;
    }, {});
};

// Cryptographically authenticate socket connection via HTTP-only JWT cookie
io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers?.cookie;
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token || socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication error: No authentication token provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded || !decoded.userId) {
            return next(new Error("Authentication error: Invalid or expired token"));
        }

        const user = await User.findById(decoded.userId).select("_id username");
        if (!user) {
            return next(new Error("Authentication error: User account not found"));
        }

        // Bind verified authenticated identity to socket
        socket.userId = user._id.toString();
        next();
    } catch (error) {
        console.error("Socket authentication error:", error.message || error);
        return next(new Error("Authentication error: Failed to authenticate socket session"));
    }
});

const userSocketMap = {}; // { [userId]: Set<socketId> }

export const getReceiverSocketId = (receiverId) => {
    if (!receiverId) return null;
    const idStr = receiverId.toString();
    if (!userSocketMap[idStr]) return null;
    return Array.from(userSocketMap[idStr])[0] || null;
};

export const getReceiverSocketIds = (receiverId) => {
    if (!receiverId) return [];
    const idStr = receiverId.toString();
    return userSocketMap[idStr] ? Array.from(userSocketMap[idStr]) : [];
};

export const disconnectUserSockets = (userId) => {
    if (!userId) return;
    const idStr = userId.toString();
    const socketIds = userSocketMap[idStr];
    if (socketIds) {
        socketIds.forEach((socketId) => {
            const socketInstance = io.sockets.sockets.get(socketId);
            if (socketInstance) {
                socketInstance.disconnect(true);
            }
        });
        delete userSocketMap[idStr];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }
};

io.on('connection', (socket) => {
    const userId = socket.userId;
    if (userId) {
        socket.join(userId);
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = new Set();
        }
        userSocketMap[userId].add(socket.id);
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        if (userId && userSocketMap[userId]) {
            userSocketMap[userId].delete(socket.id);
            if (userSocketMap[userId].size === 0) {
                delete userSocketMap[userId];
            }
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export {app, io, server};


