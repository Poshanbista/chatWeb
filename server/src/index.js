import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieparser from "cookie-parser"
import { db_config } from "./common/config/db_config.js";
import userRoutes from "./user/routes/user.routes.js";
import friendRequestRoutes from "./user/routes/friendrequest.routes.js";
import friendRoutes from "./user/routes/friends.routes.js";

import { Server } from "socket.io";
import http from "http"
import { messageHandler } from "./socket/messageHandler.js";
import { typingHandler } from "./socket/typingHandler.js";
import messageRoutes from "./user/routes/message.routes.js";

db_config();

const app = express();

// Create HTTP server from Express
const server = http.createServer(app)


// Initialize Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4001",
        credentials: true
    }
})

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieparser())

app.use(cors({
    origin: "http://localhost:4001",
    credentials: true
}));

app.use(morgan("dev"))
app.use(helmet({
    crossOriginResourcePolicy: false
}))


// pass io to requests so controller can emit events
app.use((req, res, next) => {
    req.io = io;
    next();
})

app.get("/", (req, res) => {
    res.json({ message: "server is running at successfully" })
})

// routes
app.use("/api/user", userRoutes)
app.use("/api/friend-request", friendRequestRoutes)
app.use("/api/friends", friendRoutes)
app.use("/api/messages", messageRoutes)

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("User connected:" + socket.id)

    // Each client should join their own room using their userId
    socket.on("join", (userId) => {
        socket.join(userId)   // Room per user for targeted messages
        console.log(`User ${userId} joined thier room`)
    })

    messageHandler(io, socket);
    typingHandler(io, socket);

    socket.on("disconnect", () => {
        console.log("User disconnected:" + socket.id)
    })
})

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})