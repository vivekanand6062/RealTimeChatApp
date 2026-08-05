import {Server} from "socket.io";
import http from "http";
import express from "express";

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

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

const userSocketMap = {}; // {userId->socketId}


io.on('connection', (socket)=>{
    const userId = socket.handshake.query.userId
    if(userId !== undefined){
        userSocketMap[userId] = socket.id;
    } 

    io.emit('getOnlineUsers',Object.keys(userSocketMap));

    socket.on('disconnect', ()=>{
        delete userSocketMap[userId];
        io.emit('getOnlineUsers',Object.keys(userSocketMap));
    })

})

export {app, io, server};

