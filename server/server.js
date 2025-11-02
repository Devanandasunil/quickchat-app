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

// initialize socket.io server
export const io = new SocketServer(server, {
    cors: { origin: "*" },
});

// store online users
export const userSocketMap = {}; // { userId: socketId }

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



// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

//Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);


// Connect to MongoDB
await connectDB();

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
}

// Export server for Vercel
export default server;
