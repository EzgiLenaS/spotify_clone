import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;

// ROUTES
/** app.get("/", (req, res) =>
 * {res.send("hello world");
});
*/

/**
 * The clerkMiddleware() function checks the request's
 * cookies and headers for a session JWT and if found,
 * attaches the Auth
 * object to the request object under the auth key.
 * 
 * This will add auth to req object => req.auth
 * req.auth.userId and the others
 */
app.use(clerkMiddleware());

// Middleware for getting the value from req.body
app.use(express.json()); // to parse req.body
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: path.join(__dirname, "tmp"),
        createParentPath: true,
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
        },
}));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
// Admin can create songs and albums
app.use("/api/admin", adminRoutes);
// Fetching songs
app.use("/api/songs", songRoutes);
// Albums
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

// Error handler middleware
app.use((error, req, res, next) => {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error": error.message });
});

app.listen(PORT, () => 
{
    console.log("server started on port " + PORT);
    connectDB();
});