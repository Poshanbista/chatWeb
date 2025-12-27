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

db_config();

const app = express();

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

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.json({ message: "server is running at " + PORT })
})

app.use("/api/user", userRoutes)
app.use("/api/friend-request", friendRequestRoutes)
app.use("/api/friends", friendRoutes)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})