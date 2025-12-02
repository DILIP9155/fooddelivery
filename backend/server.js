import express from "express";
import dotenv from "dotenv";
import ConnectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoute.js";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import shopRouter from "./routes/shopRoute.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoute.js";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://anupum-fooddelivery.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
// initialize socket handlers
socketHandler(io);

const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  return res.json("Api is Working");
});

server.listen(PORT, () => {
  ConnectDb();
  console.log(`Server is running on port ${PORT}`);
});
