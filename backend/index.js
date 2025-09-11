import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import tripRoute from "./routes/trip.route.js";
// import journalRoute from "./routes/journal.route.js";
import notificationRoute from "./routes/notification.route.js";
import isAuthenticated from "./middlewares/isAuthenticated.js";
import upload from "./middlewares/multer.js";
import { 
    createJournal, 
    getUserJournals, 
    getJournalById, 
    updateJournal, 
    deleteJournal, 
    getJournalStats 
} from "./controllers/journal.controller.js";
import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config();


const PORT = process.env.PORT || 8001;

const __dirname = path.resolve();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
// const corsOptions = {
//     origin: process.env.URL,
//     credentials: true
// }
// app.use(cors(corsOptions));
const corsOptions = {
    // Allow multiple frontend URLs for development
     origin: ["https://trek-tales.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow common HTTP methods
    credentials: true // This is crucial for allowing cookies
};
app.use(cors(corsOptions));

// Set custom CORS headers for preflight and credentials
app.use((req, res, next) => {
    const allowedOrigins = [
        "https://trek-tales.vercel.app",
        "http://localhost:5173"
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// yha pr apni api ayengi
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/trip", tripRoute);
// app.use("/api/v1/journal", journalRoute);
app.use("/api/v1/notification", notificationRoute);

// Journal routes (added directly due to import issues)
app.get("/api/v1/journal/test", (req, res) => {
    res.json({ message: "Journal API is working!", success: true });
});
app.post("/api/v1/journal/create", isAuthenticated, upload.array('images', 10), createJournal);
app.get("/api/v1/journal", isAuthenticated, getUserJournals);
app.get("/api/v1/journal/stats", isAuthenticated, getJournalStats);
app.get("/api/v1/journal/:id", isAuthenticated, getJournalById);
app.put("/api/v1/journal/:id", isAuthenticated, upload.array('images', 10), updateJournal);
app.delete("/api/v1/journal/:id", isAuthenticated, deleteJournal);

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
})


server.listen(PORT, () => {
    connectDB();
    console.log(`Server listen at port ${PORT}`);
});