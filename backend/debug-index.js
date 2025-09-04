import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import tripRoute from "./routes/trip.route.js";
import notificationRoute from "./routes/notification.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";

console.log("Loading environment variables...");
dotenv.config();

console.log("Environment loaded, PORT:", process.env.PORT);

const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
    origin: process.env.URL,
    credentials: true // This is crucial for allowing cookies
};
app.use(cors(corsOptions));

console.log("Setting up routes...");

// yha pr apni api ayengi
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/trip", tripRoute);
app.use("/api/v1/notification", notificationRoute);

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

console.log("Starting server...");

server.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
    console.log("Connecting to database...");
    connectDB().then(() => {
        console.log("Database connection completed");
    }).catch(err => {
        console.error("Database connection failed:", err);
    });
});

console.log("Script execution completed");
