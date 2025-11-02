import express from 'express';
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRouter.js';
import { Server as SocketServer } from 'socket.io';



// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// initialize socket.io server only in development
let io;
let userSocketMap = {};

if (process.env.NODE_ENV !== "production") {
    io = new SocketServer(server, {
        cors: { origin: "*" },
    });

    // socket.io connection handler
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        console.log("User connected: ", userId);

        if (userId) userSocketMap[userId] = socket.id;

        // Emit online users to all connected clients
        io.emit("getOnline-users", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log("User disconnected: ", userId);
            delete userSocketMap[userId];
            io.emit("getOnline-users", Object.keys(userSocketMap));
        });
    });
}

export { io, userSocketMap };



// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

//Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
connectDB();

// Export app for Vercel serverless functions
export default app;
